import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

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
    const reportType = searchParams.get('type') || 'financial';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || '30';

    // Calculate date range
    let fromDate: Date;
    let toDate: Date = new Date();

    if (startDate && endDate) {
      fromDate = new Date(startDate);
      toDate = new Date(endDate);
    } else {
      const days = parseInt(period);
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
    }

    // Fetch data from all sources
    const [expendituresData, incomeData, staffData, payrollData, leaveData, queriesData] = await Promise.all([
      kv.get('expenditures:index'),
      kv.get('income:index'),
      kv.get('staff:index'),
      kv.get('payroll:index'),
      kv.get('leave:index'),
      kv.get('queries:index')
    ]);

    const expenditures = expendituresData ? JSON.parse(expendituresData) : [];
    const income = incomeData ? JSON.parse(incomeData) : [];
    const staff = staffData ? JSON.parse(staffData) : [];
    const payroll = payrollData ? JSON.parse(payrollData) : [];
    const leave = leaveData ? JSON.parse(leaveData) : [];
    const queries = queriesData ? JSON.parse(queriesData) : [];

    // Filter by organization and date range
    const orgExpenditures = expenditures.filter((e: any) => 
      e.orgId === payload.orgId && 
      new Date(e.createdAt) >= fromDate && 
      new Date(e.createdAt) <= toDate
    );

    const orgIncome = income.filter((i: any) => 
      i.orgId === payload.orgId && 
      new Date(i.createdAt) >= fromDate && 
      new Date(i.createdAt) <= toDate
    );

    const orgStaff = staff.filter((s: any) => s.orgId === payload.orgId);
    const orgPayroll = payroll.filter((p: any) => s.orgId === payload.orgId);
    const orgLeave = leave.filter((l: any) => l.orgId === payload.orgId);
    const orgQueries = queries.filter((q: any) => q.orgId === payload.orgId);

    // Generate report based on type
    let report: any = {};

    switch (reportType) {
      case 'financial':
        report = generateFinancialReport(orgExpenditures, orgIncome);
        break;
      case 'hr':
        report = generateHRReport(orgStaff, orgPayroll, orgLeave);
        break;
      case 'operations':
        report = generateOperationsReport(orgQueries, orgLeave);
        break;
      case 'comprehensive':
        report = generateComprehensiveReport(orgExpenditures, orgIncome, orgStaff, orgPayroll, orgLeave, orgQueries);
        break;
      default:
        report = generateFinancialReport(orgExpenditures, orgIncome);
    }

    return NextResponse.json({
      reportType,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        days: Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      data: report
    });

  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateFinancialReport(expenditures: any[], income: any[]) {
  const totalExpenditures = expenditures.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
  const netProfit = totalIncome - totalExpenditures;

  // Expenditure breakdown by category
  const expenditureBreakdown = expenditures.reduce((acc, e) => {
    const category = e.category || 'Other';
    acc[category] = (acc[category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  // Income breakdown by source
  const incomeBreakdown = income.reduce((acc, i) => {
    const source = i.source || 'Other';
    acc[source] = (acc[source] || 0) + (i.amount || 0);
    return acc;
  }, {});

  return {
    summary: {
      totalIncome,
      totalExpenditures,
      netProfit,
      profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
    },
    expenditureBreakdown,
    incomeBreakdown,
    recentTransactions: {
      expenditures: expenditures.slice(0, 10),
      income: income.slice(0, 10)
    }
  };
}

function generateHRReport(staff: any[], payroll: any[], leave: any[]) {
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const totalPayroll = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const averageSalary = totalStaff > 0 ? totalPayroll / totalStaff : 0;

  // Leave statistics
  const totalLeaveRequests = leave.length;
  const approvedLeave = leave.filter(l => l.status === 'approved').length;
  const pendingLeave = leave.filter(l => l.status === 'pending').length;

  // Department breakdown
  const departmentBreakdown = staff.reduce((acc, s) => {
    const dept = s.department || 'Other';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      totalStaff,
      activeStaff,
      totalPayroll,
      averageSalary: Math.round(averageSalary),
      totalLeaveRequests,
      approvedLeave,
      pendingLeave
    },
    departmentBreakdown,
    recentActivities: {
      newStaff: staff.slice(0, 5),
      recentLeave: leave.slice(0, 5)
    }
  };
}

function generateOperationsReport(queries: any[], leave: any[]) {
  const totalQueries = queries.length;
  const openQueries = queries.filter(q => q.status === 'open').length;
  const resolvedQueries = queries.filter(q => q.status === 'resolved').length;
  const inProgressQueries = queries.filter(q => q.status === 'in_progress').length;

  // Query breakdown by category
  const queryBreakdown = queries.reduce((acc, q) => {
    const category = q.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Leave statistics
  const totalLeaveRequests = leave.length;
  const approvedLeave = leave.filter(l => l.status === 'approved').length;

  return {
    summary: {
      totalQueries,
      openQueries,
      resolvedQueries,
      inProgressQueries,
      resolutionRate: totalQueries > 0 ? ((resolvedQueries / totalQueries) * 100).toFixed(2) : 0,
      totalLeaveRequests,
      approvedLeave
    },
    queryBreakdown,
    recentActivities: {
      recentQueries: queries.slice(0, 5),
      recentLeave: leave.slice(0, 5)
    }
  };
}

function generateComprehensiveReport(expenditures: any[], income: any[], staff: any[], payroll: any[], leave: any[], queries: any[]) {
  const financial = generateFinancialReport(expenditures, income);
  const hr = generateHRReport(staff, payroll, leave);
  const operations = generateOperationsReport(queries, leave);

  return {
    financial,
    hr,
    operations,
    overview: {
      totalRevenue: financial.summary.totalIncome,
      totalExpenses: financial.summary.totalExpenditures,
      netProfit: financial.summary.netProfit,
      totalStaff: hr.summary.totalStaff,
      totalQueries: operations.summary.totalQueries,
      totalLeaveRequests: operations.summary.totalLeaveRequests
    }
  };
}
