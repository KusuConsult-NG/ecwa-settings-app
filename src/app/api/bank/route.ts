import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { BankAccount, CreateBankAccountRequest, generateAccountId } from '@/lib/bank';

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
    const accountType = searchParams.get('accountType');
    const bankName = searchParams.get('bankName');
    const search = searchParams.get('search');

    const bankData = await kv.get('bank:index');
    let accounts: BankAccount[] = bankData ? JSON.parse(bankData) : [];

    accounts = accounts.filter(a => a.orgId === payload.orgId);

    if (status) accounts = accounts.filter(a => a.status === status);
    if (accountType) accounts = accounts.filter(a => a.accountType === accountType);
    if (bankName) accounts = accounts.filter(a => a.bankName.toLowerCase().includes(bankName.toLowerCase()));
    if (search) {
      const searchLower = search.toLowerCase();
      accounts = accounts.filter(a =>
        a.accountName.toLowerCase().includes(searchLower) ||
        a.accountNumber.includes(searchLower) ||
        a.bankName.toLowerCase().includes(searchLower)
      );
    }

    accounts.sort((a, b) => a.accountName.localeCompare(b.accountName));

    const summary = {
      total: accounts.length,
      active: accounts.filter(a => a.status === 'active').length,
      inactive: accounts.filter(a => a.status === 'inactive').length,
      suspended: accounts.filter(a => a.status === 'suspended').length,
      closed: accounts.filter(a => a.status === 'closed').length,
      totalBalance: accounts.reduce((sum, a) => sum + a.currentBalance, 0)
    };

    return NextResponse.json({ accounts, summary });

  } catch (error) {
    console.error('Get bank accounts error:', error);
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

    const {
      accountName, accountNumber, bankName, bankCode, accountType, currency,
      openingDate, branch, swiftCode, iban, currentBalance, authorizedSignatories, notes
    }: CreateBankAccountRequest = await req.json();

    if (!accountName || !accountNumber || !bankName || !accountType || !currency || !openingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['savings', 'current', 'fixed_deposit', 'investment'];
    if (!validTypes.includes(accountType)) {
      return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
    }

    const bankData = await kv.get('bank:index');
    const existingAccounts: BankAccount[] = bankData ? JSON.parse(bankData) : [];
    
    const accountExists = existingAccounts.some(a => 
      a.accountNumber === accountNumber && a.orgId === payload.orgId
    );

    if (accountExists) {
      return NextResponse.json({ error: 'Account with this number already exists' }, { status: 409 });
    }

    const account: BankAccount = {
      id: generateAccountId(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      bankCode: bankCode?.trim() || '',
      accountType,
      currency: currency.trim().toUpperCase(),
      openingDate,
      branch: branch?.trim() || '',
      swiftCode: swiftCode?.trim() || '',
      iban: iban?.trim() || '',
      currentBalance: Number(currentBalance) || 0,
      status: 'active',
      authorizedSignatories: Array.isArray(authorizedSignatories) ? authorizedSignatories : [],
      notes: notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    await kv.set(`bank:${account.id}`, JSON.stringify(account));
    existingAccounts.push(account);
    await kv.set('bank:index', JSON.stringify(existingAccounts));

    return NextResponse.json({
      success: true,
      account,
      message: 'Bank account created successfully'
    });

  } catch (error) {
    console.error('Create bank account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
