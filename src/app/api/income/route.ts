import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/lib/auth"
import { kv } from "@/lib/kv"
import { IncomeRecord, CreateIncomeRequest } from "@/lib/income"
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
    const body: CreateIncomeRequest = await req.json()
    const { ref, source, giver, narration, amount, bankRef } = body

    // Validate required fields
    if (!ref || !source || !giver || !narration || !amount || !bankRef) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create income record
    const income: IncomeRecord = {
      id: crypto.randomUUID(),
      ref: ref.trim(),
      source: source.trim(),
      giver: giver.trim(),
      narration: narration.trim(),
      amount: Number(amount),
      bankRef: bankRef.trim(),
      submittedBy: payload.sub as string,
      submittedByName: (payload.name as string) || 'Unknown User',
      submittedAt: new Date().toISOString(),
      orgId: (payload.orgId as string) || '',
      orgName: (payload.orgName as string) || 'ECWA Organization',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to storage
    await kv.set(`income:${income.id}`, JSON.stringify(income))

    // Add to user's income list
    const userIncomeKey = `user_income:${payload.sub}`
    const existingIncome = await kv.get(userIncomeKey)
    const incomeList = existingIncome ? JSON.parse(existingIncome) : []
    incomeList.push(income.id)
    await kv.set(userIncomeKey, JSON.stringify(incomeList))

    // Add to organization's income list
    const orgIncomeKey = `org_income:${payload.orgId}`
    const existingOrgIncome = await kv.get(orgIncomeKey)
    const orgIncomeList = existingOrgIncome ? JSON.parse(existingOrgIncome) : []
    orgIncomeList.push(income.id)
    await kv.set(orgIncomeKey, JSON.stringify(orgIncomeList))

    return NextResponse.json({ 
      ok: true, 
      income: {
        id: income.id,
        ref: income.ref,
        source: income.source,
        giver: income.giver,
        amount: income.amount,
        submittedAt: income.submittedAt
      }
    })

  } catch (error) {
    console.error('Create income error:', error)
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

    // Get income for the user's organization
    const orgIncomeKey = `org_income:${payload.orgId}`
    const incomeIds = await kv.get(orgIncomeKey)
    
    let incomeList = []

    if (incomeIds) {
      const ids = JSON.parse(incomeIds)
      
      for (const id of ids) {
        const incomeData = await kv.get(`income:${id}`)
        if (incomeData) {
          incomeList.push(JSON.parse(incomeData))
        }
      }
    } else {
      // Return mock data if no income exists
      incomeList = [
        {
          id: 'inc_1',
          ref: 'INC-2024-001',
          source: 'Tithes',
          giver: 'Church Members',
          narration: 'Monthly tithes collection',
          amount: 150000,
          bankRef: 'TXN123456789',
          submittedBy: payload.sub,
          submittedByName: payload.name || 'Current User',
          submittedAt: new Date().toISOString(),
          orgId: payload.orgId,
          orgName: payload.orgName || 'ECWA Organization',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }

    // Sort by creation date (newest first)
    incomeList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ income: incomeList })

  } catch (error) {
    console.error('Get income error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
