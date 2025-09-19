import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveRecord, generateExecutiveId } from '@/lib/executive';

// Mock storage - replace with real database
let executives: ExecutiveRecord[] = [
  {
    id: 'EXE-1703123456789-abc123def',
    name: 'John Doe',
    position: 'President',
    email: 'john.doe@ecwa.org',
    phone: '+234-801-234-5678',
    address: '123 Church Street, Lagos, Nigeria',
    dateOfBirth: '1980-05-15',
    dateOfAppointment: '2024-01-01',
    termLength: 24,
    status: 'active',
    qualifications: 'B.Sc. Business Administration, M.Sc. Leadership',
    previousExperience: 'Former Youth Coordinator (2020-2023), Church Elder (2018-2023)',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+234-802-345-6789',
      relationship: 'Spouse'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      position,
      email,
      phone,
      address,
      dateOfBirth,
      dateOfAppointment,
      termLength,
      qualifications,
      previousExperience,
      emergencyContact
    } = body;

    // Validation
    if (!name || !position || !email || !phone || !address || !dateOfBirth || !dateOfAppointment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingExecutive = executives.find(exec => exec.email === email);
    if (existingExecutive) {
      return NextResponse.json(
        { error: 'Executive with this email already exists' },
        { status: 400 }
      );
    }

    const executive: ExecutiveRecord = {
      id: generateExecutiveId(),
      name: name.trim(),
      position: position.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      dateOfBirth,
      dateOfAppointment,
      termLength: termLength || 24,
      status: 'active',
      qualifications: qualifications?.trim() || '',
      previousExperience: previousExperience?.trim() || '',
      emergencyContact: {
        name: emergencyContact?.name?.trim() || '',
        phone: emergencyContact?.phone?.trim() || '',
        relationship: emergencyContact?.relationship?.trim() || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user' // TODO: Get from auth context
    };

    executives.push(executive);

    return NextResponse.json({
      success: true,
      executive,
      message: 'Executive added successfully'
    });

  } catch (error) {
    console.error('Error creating executive:', error);
    return NextResponse.json(
      { error: 'Failed to create executive' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const search = searchParams.get('search');

    let filteredExecutives = [...executives];

    // Filter by status
    if (status) {
      filteredExecutives = filteredExecutives.filter(exec => exec.status === status);
    }

    // Filter by position
    if (position) {
      filteredExecutives = filteredExecutives.filter(exec => exec.position === position);
    }

    // Search by name, email, or position
    if (search) {
      const searchLower = search.toLowerCase();
      filteredExecutives = filteredExecutives.filter(exec =>
        exec.name.toLowerCase().includes(searchLower) ||
        exec.email.toLowerCase().includes(searchLower) ||
        exec.position.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    filteredExecutives.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      executives: filteredExecutives,
      total: filteredExecutives.length
    });

  } catch (error) {
    console.error('Error fetching executives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executives' },
      { status: 500 }
    );
  }
}
