import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/lib/auth"
import { kv } from "@/lib/kv"
import { ExpenditureRecord, CreateExpenditureRequest } from "@/lib/expenditure"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Get user from JWT token
    const token = req.cookies.get('auth')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Parse request body
    const body: CreateExpenditureRequest = await req.json()
    const { purpose, category, amount, beneficiary, bankName, accountNumber, viaAgency } = body

    // Validate required fields
    if (!purpose || !category || !amount || !beneficiary) {
      return NextResponse.json(
        { error: 'Purpose, category, amount, and beneficiary are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create expenditure record
    const expenditure: ExpenditureRecord = {
      id: crypto.randomUUID(),
      purpose: purpose.trim(),
      category,
      amount: Number(amount),
      beneficiary: beneficiary.trim(),
      bankName: bankName?.trim(),
      accountNumber: accountNumber?.trim(),
      viaAgency: Boolean(viaAgency),
      status: 'pending',
      submittedBy: payload.sub as string,
      submittedByName: (payload.name as string) || 'Unknown User',
      submittedAt: new Date().toISOString(),
      orgId: (payload.orgId as string) || '',
      orgName: (payload.orgName as string) || 'ECWA Organization',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to storage
    await kv.set(`expenditure:${expenditure.id}`, JSON.stringify(expenditure))

    // Add to user's expenditures list
    const userExpendituresKey = `user_expenditures:${payload.sub}`
    const existingExpenditures = await kv.get(userExpendituresKey)
    const expenditures = existingExpenditures ? JSON.parse(existingExpenditures) : []
    expenditures.push(expenditure.id)
    await kv.set(userExpendituresKey, JSON.stringify(expenditures))

    // Add to organization's expenditures list
    const orgExpendituresKey = `org_expenditures:${payload.orgId}`
    const existingOrgExpenditures = await kv.get(orgExpendituresKey)
    const orgExpenditures = existingOrgExpenditures ? JSON.parse(existingOrgExpenditures) : []
    orgExpenditures.push(expenditure.id)
    await kv.set(orgExpendituresKey, JSON.stringify(orgExpenditures))

    return NextResponse.json({ 
      ok: true, 
      expenditure: {
        id: expenditure.id,
        purpose: expenditure.purpose,
        category: expenditure.category,
        amount: expenditure.amount,
        status: expenditure.status,
        submittedAt: expenditure.submittedAt
      }
    })

  } catch (error) {
    console.error('Create expenditure error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get user from JWT token
    const token = req.cookies.get('auth')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get expenditures for the user's organization
    const orgExpendituresKey = `org_expenditures:${payload.orgId}`
    const expenditureIds = await kv.get(orgExpendituresKey)
    
    if (!expenditureIds) {
      return NextResponse.json({ expenditures: [] })
    }

    const ids = JSON.parse(expenditureIds)
    const expenditures = []

    for (const id of ids) {
      const expenditureData = await kv.get(`expenditure:${id}`)
      if (expenditureData) {
        expenditures.push(JSON.parse(expenditureData))
      }
    }

    // Sort by creation date (newest first)
    expenditures.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ expenditures })

  } catch (error) {
    console.error('Get expenditures error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
