import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
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
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const auditData = await kv.get('audit:index');
    let logs: AuditLog[] = auditData ? JSON.parse(auditData) : [];

    // Filter by organization
    logs = logs.filter(log => log.orgId === payload.orgId);

    // Apply filters
    if (action) logs = logs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
    if (resource) logs = logs.filter(log => log.resource.toLowerCase().includes(resource.toLowerCase()));
    if (userId) logs = logs.filter(log => log.userId === userId);
    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      logs = logs.filter(log => new Date(log.timestamp) <= end);
    }

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    // Summary statistics
    const summary = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      actions: [...new Set(logs.map(log => log.action))],
      resources: [...new Set(logs.map(log => log.resource))],
      users: [...new Set(logs.map(log => log.userName))],
      recentActivity: logs.slice(0, 10)
    };

    return NextResponse.json({
      logs: paginatedLogs,
      summary
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to create audit log
export async function createAuditLog(
  action: string,
  resource: string,
  resourceId: string | undefined,
  userId: string,
  userName: string,
  userEmail: string,
  details: any,
  ipAddress: string,
  userAgent: string,
  orgId: string,
  orgName: string
) {
  try {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      action,
      resource,
      resourceId,
      userId,
      userName,
      userEmail,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      orgId,
      orgName
    };

    // Save individual log
    await kv.set(`audit:${log.id}`, JSON.stringify(log));

    // Update audit index
    const auditData = await kv.get('audit:index');
    const existingLogs: AuditLog[] = auditData ? JSON.parse(auditData) : [];
    existingLogs.push(log);
    await kv.set('audit:index', JSON.stringify(existingLogs));

    return log;
  } catch (error) {
    console.error('Create audit log error:', error);
  }
}
