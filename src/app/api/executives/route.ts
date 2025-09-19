import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveRecord, generateExecutiveId } from '@/lib/executive';
import { kv } from '@/lib/kv';
import { verifyJwt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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
    const executivesData = await kv.get('executives:index');
    const executives: ExecutiveRecord[] = executivesData ? JSON.parse(executivesData) : [];
    const existingExecutive = executives.find(exec => exec.email === email.toLowerCase());
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
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save to database
    await kv.set(`executive:${executive.id}`, JSON.stringify(executive));
    
    // Update executives index
    executives.push(executive);
    await kv.set('executives:index', JSON.stringify(executives));

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
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const search = searchParams.get('search');

    // Get executives from database
    const executivesData = await kv.get('executives:index');
    let executives: ExecutiveRecord[] = executivesData ? JSON.parse(executivesData) : [];

    // Filter by organization
    executives = executives.filter(exec => exec.orgId === payload.orgId);

    // Filter by status
    if (status) {
      executives = executives.filter(exec => exec.status === status);
    }

    // Filter by position
    if (position) {
      executives = executives.filter(exec => exec.position === position);
    }

    // Search by name, email, or position
    if (search) {
      const searchLower = search.toLowerCase();
      executives = executives.filter(exec =>
        exec.name.toLowerCase().includes(searchLower) ||
        exec.email.toLowerCase().includes(searchLower) ||
        exec.position.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    executives.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      executives,
      total: executives.length
    });

  } catch (error) {
    console.error('Error fetching executives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executives' },
      { status: 500 }
    );
  }
}
