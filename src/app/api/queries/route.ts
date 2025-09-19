import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

// Interface moved to @/lib/queries
interface QueryRecord {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'technical' | 'financial' | 'hr' | 'administrative' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  submittedBy: string;
  submittedByName: string;
  submittedByEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolution?: string;
  tags: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  orgId: string;
  orgName: string;
}

// GET /api/queries - Get all queries
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
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const submittedBy = searchParams.get('submittedBy');
    const search = searchParams.get('search');

    // Get queries from database
    const queriesData = await kv.get('queries:index');
    let queries: QueryRecord[] = queriesData ? JSON.parse(queriesData) : [];

    // Filter by organization
    queries = queries.filter(q => q.orgId === payload.orgId);

    // Apply filters
    if (status) {
      queries = queries.filter(q => q.status === status);
    }

    if (category) {
      queries = queries.filter(q => q.category === category);
    }

    if (priority) {
      queries = queries.filter(q => q.priority === priority);
    }

    if (assignedTo) {
      queries = queries.filter(q => q.assignedTo === assignedTo);
    }

    if (submittedBy) {
      queries = queries.filter(q => q.submittedBy === submittedBy);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      queries = queries.filter(q =>
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by priority and creation date
    queries.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Calculate summary statistics
    const summary = {
      total: queries.length,
      open: queries.filter(q => q.status === 'open').length,
      inProgress: queries.filter(q => q.status === 'in_progress').length,
      resolved: queries.filter(q => q.status === 'resolved').length,
      closed: queries.filter(q => q.status === 'closed').length,
      urgent: queries.filter(q => q.priority === 'urgent').length,
      high: queries.filter(q => q.priority === 'high').length
    };

    return NextResponse.json({
      queries,
      summary
    });

  } catch (error) {
    console.error('Get queries error:', error);
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
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      priority,
      tags,
      attachments
    } = body;

    // Validation
    if (!title || !description || !category || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['general', 'technical', 'financial', 'hr', 'administrative', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    // Create query record
    const query: QueryRecord = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'open',
      submittedBy: payload.sub as string,
      submittedByName: payload.name as string,
      submittedByEmail: payload.email as string,
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(tag => tag) : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save to database
    await kv.set(`queries:${query.id}`, JSON.stringify(query));
    
    // Update queries index
    const queriesData = await kv.get('queries:index');
    const existingQueries: QueryRecord[] = queriesData ? JSON.parse(queriesData) : [];
    existingQueries.push(query);
    await kv.set('queries:index', JSON.stringify(existingQueries));

    return NextResponse.json({
      success: true,
      query,
      message: 'Query submitted successfully'
    });

  } catch (error) {
    console.error('Create query error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
