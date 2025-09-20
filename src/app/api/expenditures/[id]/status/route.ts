import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/lib/auth"
import { kv } from "@/lib/kv"
import { ExpenditureRecord, UpdateExpenditureStatusRequest } from "@/lib/expenditure"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user has permission to approve/reject
    const userRole = payload.role as string
    const canApprove = ['admin', 'President', 'General Secretary', 'Treasurer', 'Chairman', 'Secretary'].includes(userRole)
    
    if (!canApprove) {
      return NextResponse.json(
        { error: 'Insufficient permissions to approve/reject expenditures' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: UpdateExpenditureStatusRequest = await req.json()
    const { status, rejectionNote } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      )
    }

    if (status === 'rejected' && !rejectionNote?.trim()) {
      return NextResponse.json(
        { error: 'Rejection note is required when rejecting an expenditure' },
        { status: 400 }
      )
    }

    // Get the expenditure
    const expenditureData = await kv.get(`expenditure:${params.id}`)
    if (!expenditureData) {
      return NextResponse.json(
        { error: 'Expenditure not found' },
        { status: 404 }
      )
    }

    const expenditure: ExpenditureRecord = JSON.parse(expenditureData)

    // Check if expenditure belongs to user's organization
    if (expenditure.orgId !== payload.orgId) {
      return NextResponse.json(
        { error: 'Expenditure not found' },
        { status: 404 }
      )
    }

    // Check if expenditure is already processed
    if (expenditure.status !== 'pending') {
      return NextResponse.json(
        { error: 'Expenditure has already been processed' },
        { status: 400 }
      )
    }

    // Update expenditure status
    const updatedExpenditure: ExpenditureRecord = {
      ...expenditure,
      status,
      rejectionNote: status === 'rejected' ? rejectionNote?.trim() : undefined,
      approvedBy: status === 'approved' ? payload.sub as string : undefined,
      approvedByName: status === 'approved' ? payload.name as string : undefined,
      approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
      rejectedBy: status === 'rejected' ? payload.sub as string : undefined,
      rejectedByName: status === 'rejected' ? payload.name as string : undefined,
      rejectedAt: status === 'rejected' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    }

    // Save updated expenditure
    await kv.set(`expenditure:${params.id}`, JSON.stringify(updatedExpenditure))

    return NextResponse.json({ 
      ok: true, 
      expenditure: {
        id: updatedExpenditure.id,
        status: updatedExpenditure.status,
        rejectionNote: updatedExpenditure.rejectionNote,
        approvedByName: updatedExpenditure.approvedByName,
        approvedAt: updatedExpenditure.approvedAt,
        rejectedByName: updatedExpenditure.rejectedByName,
        rejectedAt: updatedExpenditure.rejectedAt,
      }
    })

  } catch (error) {
    console.error('Update expenditure status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
