import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { QueryRecord, CreateQueryRequest, generateQueryId } from '@/lib/queries';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/queries - Get all queries
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub || !payload.orgId || !payload.orgName) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    // Get all queries from KV store
    const queriesData = await kv.get('queries:index');
    const allQueries: QueryRecord[] = queriesData ? JSON.parse(queriesData) : [];

    // Filter queries by organization
    let filteredQueries = allQueries.filter(query => query.orgId === (payload.orgId as string));

    // Apply additional filters
    if (status) {
      filteredQueries = filteredQueries.filter(query => query.status === status);
    }
    if (category) {
      filteredQueries = filteredQueries.filter(query => query.category === category);
    }
    if (priority) {
      filteredQueries = filteredQueries.filter(query => query.priority === priority);
    }
    if (search) {
      filteredQueries = filteredQueries.filter(query => 
        query.title.toLowerCase().includes(search.toLowerCase()) ||
        query.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ queries: filteredQueries });
  } catch (error) {
    console.error('Queries GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/queries - Create new query
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub || !payload.orgId || !payload.orgName) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body: CreateQueryRequest = await req.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Queries start as 'open' status and can be assigned later

    // Create query record
    const queryRecord: QueryRecord = {
      id: generateQueryId(),
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save individual query record
    await kv.set(`query:${queryRecord.id}`, JSON.stringify(queryRecord));

    // Update queries index
    const queriesData = await kv.get('queries:index');
    const existingQueries: QueryRecord[] = queriesData ? JSON.parse(queriesData) : [];
    const updatedQueries = [...existingQueries, queryRecord];
    await kv.set('queries:index', JSON.stringify(updatedQueries));

    return NextResponse.json({ 
      message: 'Query created successfully', 
      query: queryRecord 
    }, { status: 201 });
  } catch (error) {
    console.error('Query POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}