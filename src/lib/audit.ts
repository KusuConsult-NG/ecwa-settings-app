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
