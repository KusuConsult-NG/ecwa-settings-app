import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

export interface AgencyRecord {
  id: string;
  name: string;
  type: 'ministry' | 'department' | 'committee' | 'fellowship' | 'group';
  description: string;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  memberCount: number;
  establishedDate: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  status: 'active' | 'inactive' | 'suspended';
  parentOrganization?: string;
  parentOrganizationName?: string;
  objectives: string[];
  activities: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export async function GET(req: NextRequest) {
  try {
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
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const agenciesData = await kv.get('agencies:index');
    let agencies: AgencyRecord[] = agenciesData ? JSON.parse(agenciesData) : [];

    agencies = agencies.filter(a => a.orgId === payload.orgId);

    if (status) agencies = agencies.filter(a => a.status === status);
    if (type) agencies = agencies.filter(a => a.type === type);
    if (search) {
      const searchLower = search.toLowerCase();
      agencies = agencies.filter(a =>
        a.name.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.leader.name.toLowerCase().includes(searchLower)
      );
    }

    agencies.sort((a, b) => a.name.localeCompare(b.name));

    const summary = {
      total: agencies.length,
      active: agencies.filter(a => a.status === 'active').length,
      inactive: agencies.filter(a => a.status === 'inactive').length,
      suspended: agencies.filter(a => a.status === 'suspended').length,
      totalMembers: agencies.reduce((sum, a) => sum + a.memberCount, 0)
    };

    return NextResponse.json({ agencies, summary });

  } catch (error) {
    console.error('Get agencies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      name, type, description, leader, memberCount, establishedDate,
      meetingDay, meetingTime, venue, parentOrganization, objectives, activities, contactInfo
    } = body;

    if (!name || !type || !description || !leader || !establishedDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['ministry', 'department', 'committee', 'fellowship', 'group'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const agenciesData = await kv.get('agencies:index');
    const existingAgencies: AgencyRecord[] = agenciesData ? JSON.parse(agenciesData) : [];
    
    const nameExists = existingAgencies.some(a => 
      a.name.toLowerCase() === name.toLowerCase() && a.orgId === payload.orgId
    );

    if (nameExists) {
      return NextResponse.json({ error: 'Agency with this name already exists' }, { status: 409 });
    }

    const agency: AgencyRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      description: description.trim(),
      leader: {
        name: leader.name.trim(),
        email: leader.email.trim().toLowerCase(),
        phone: leader.phone.trim()
      },
      memberCount: Number(memberCount) || 0,
      establishedDate,
      meetingDay: meetingDay?.trim() || '',
      meetingTime: meetingTime?.trim() || '',
      venue: venue?.trim() || '',
      status: 'active',
      parentOrganization: parentOrganization || '',
      parentOrganizationName: parentOrganization || '',
      objectives: Array.isArray(objectives) ? objectives.map(o => o.trim()).filter(o => o) : [],
      activities: Array.isArray(activities) ? activities.map(a => a.trim()).filter(a => a) : [],
      contactInfo: {
        email: contactInfo?.email?.trim().toLowerCase() || '',
        phone: contactInfo?.phone?.trim() || '',
        address: contactInfo?.address?.trim() || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    await kv.set(`agencies:${agency.id}`, JSON.stringify(agency));
    existingAgencies.push(agency);
    await kv.set('agencies:index', JSON.stringify(existingAgencies));

    return NextResponse.json({
      success: true,
      agency,
      message: 'Agency created successfully'
    });

  } catch (error) {
    console.error('Create agency error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
