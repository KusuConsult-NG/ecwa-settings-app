import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveRecord } from '@/lib/executive';

// Mock storage - replace with real database
let executives: ExecutiveRecord[] = [];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Find the executive
    const executiveIndex = executives.findIndex(exec => exec.id === id);
    if (executiveIndex === -1) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      );
    }

    // Update the executive
    executives[executiveIndex] = {
      ...executives[executiveIndex],
      status: status as 'active' | 'inactive' | 'suspended',
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      executive: executives[executiveIndex],
      message: `Executive status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating executive status:', error);
    return NextResponse.json(
      { error: 'Failed to update executive status' },
      { status: 500 }
    );
  }
}
