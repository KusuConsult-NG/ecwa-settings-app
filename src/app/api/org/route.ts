import { NextResponse } from "next/server"
import { kv } from "@/lib/kv"

// Basic org storage in KV (or memory fallback). Keys:
// org:GCC:id, org:DCC:id, org:LCC:id, org:LC:id
// parent relationships stored in each record

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const parentId = searchParams.get('parentId')
  
  // Check if we need to seed initial data
  const raw = await kv.get(`org:index`)
  let index = raw ? JSON.parse(raw) as any[] : []
  
  // If no data exists, seed with comprehensive ECWA data
  if (index.length === 0) {
    index = await seedECWAData()
  }
  
  const filtered = index.filter((o) => (!type || o.type===type) && (!parentId || o.parentId===parentId))
  return NextResponse.json({ items: filtered })
}

async function seedECWAData() {
  const comprehensiveData = [
    // GCC (Global Coordinating Council)
    { id: 'GCC-001', name: 'ECWA Global Headquarters', type: 'GCC', parentId: null },
    
    // DCCs (District Coordinating Councils)
    { id: 'DCC-001', name: 'ECWA Jos DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-002', name: 'ECWA Kaduna DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-003', name: 'ECWA Abuja DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-004', name: 'ECWA Kano DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-005', name: 'ECWA Lagos DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-006', name: 'ECWA Port Harcourt DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-007', name: 'ECWA Ibadan DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-008', name: 'ECWA Bauchi DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-009', name: 'ECWA Maiduguri DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-010', name: 'ECWA Sokoto DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-011', name: 'ECWA Minna DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-012', name: 'ECWA Makurdi DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-013', name: 'ECWA Yola DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-014', name: 'ECWA Gombe DCC', type: 'DCC', parentId: 'GCC-001' },
    { id: 'DCC-015', name: 'ECWA Damaturu DCC', type: 'DCC', parentId: 'GCC-001' },
    
    // LCCs under Jos DCC
    { id: 'LCC-001', name: 'ECWA Jos Central LCC', type: 'LCC', parentId: 'DCC-001' },
    { id: 'LCC-002', name: 'ECWA Jos North LCC', type: 'LCC', parentId: 'DCC-001' },
    { id: 'LCC-003', name: 'ECWA Jos South LCC', type: 'LCC', parentId: 'DCC-001' },
    { id: 'LCC-004', name: 'ECWA Jos East LCC', type: 'LCC', parentId: 'DCC-001' },
    { id: 'LCC-005', name: 'ECWA Jos West LCC', type: 'LCC', parentId: 'DCC-001' },
    
    // LCCs under Kaduna DCC
    { id: 'LCC-006', name: 'ECWA Kaduna Central LCC', type: 'LCC', parentId: 'DCC-002' },
    { id: 'LCC-007', name: 'ECWA Kaduna North LCC', type: 'LCC', parentId: 'DCC-002' },
    { id: 'LCC-008', name: 'ECWA Kaduna South LCC', type: 'LCC', parentId: 'DCC-002' },
    { id: 'LCC-009', name: 'ECWA Zaria LCC', type: 'LCC', parentId: 'DCC-002' },
    { id: 'LCC-010', name: 'ECWA Kafanchan LCC', type: 'LCC', parentId: 'DCC-002' },
    
    // LCCs under Abuja DCC
    { id: 'LCC-011', name: 'ECWA Abuja Central LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-012', name: 'ECWA Garki LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-013', name: 'ECWA Wuse LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-014', name: 'ECWA Kubwa LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-015', name: 'ECWA Nyanya LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-016', name: 'ECWA Gwagwalada LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-017', name: 'ECWA Bwari LCC', type: 'LCC', parentId: 'DCC-003' },
    { id: 'LCC-018', name: 'ECWA Kuje LCC', type: 'LCC', parentId: 'DCC-003' },
    
    // LCCs under Kano DCC
    { id: 'LCC-019', name: 'ECWA Kano Central LCC', type: 'LCC', parentId: 'DCC-004' },
    { id: 'LCC-020', name: 'ECWA Kano North LCC', type: 'LCC', parentId: 'DCC-004' },
    { id: 'LCC-021', name: 'ECWA Kano South LCC', type: 'LCC', parentId: 'DCC-004' },
    { id: 'LCC-022', name: 'ECWA Wudil LCC', type: 'LCC', parentId: 'DCC-004' },
    { id: 'LCC-023', name: 'ECWA Gwarzo LCC', type: 'LCC', parentId: 'DCC-004' },
    
    // LCCs under Lagos DCC
    { id: 'LCC-024', name: 'ECWA Lagos Island LCC', type: 'LCC', parentId: 'DCC-005' },
    { id: 'LCC-025', name: 'ECWA Lagos Mainland LCC', type: 'LCC', parentId: 'DCC-005' },
    { id: 'LCC-026', name: 'ECWA Ikeja LCC', type: 'LCC', parentId: 'DCC-005' },
    { id: 'LCC-027', name: 'ECWA Surulere LCC', type: 'LCC', parentId: 'DCC-005' },
    { id: 'LCC-028', name: 'ECWA Mushin LCC', type: 'LCC', parentId: 'DCC-005' },
    { id: 'LCC-029', name: 'ECWA Alaba LCC', type: 'LCC', parentId: 'DCC-005' },
    { id: 'LCC-030', name: 'ECWA Festac LCC', type: 'LCC', parentId: 'DCC-005' },
    
    // LCCs under Port Harcourt DCC
    { id: 'LCC-031', name: 'ECWA Port Harcourt Central LCC', type: 'LCC', parentId: 'DCC-006' },
    { id: 'LCC-032', name: 'ECWA Port Harcourt North LCC', type: 'LCC', parentId: 'DCC-006' },
    { id: 'LCC-033', name: 'ECWA Port Harcourt South LCC', type: 'LCC', parentId: 'DCC-006' },
    { id: 'LCC-034', name: 'ECWA Obio-Akpor LCC', type: 'LCC', parentId: 'DCC-006' },
    { id: 'LCC-035', name: 'ECWA Eleme LCC', type: 'LCC', parentId: 'DCC-006' },
    
    // LCCs under Ibadan DCC
    { id: 'LCC-036', name: 'ECWA Ibadan Central LCC', type: 'LCC', parentId: 'DCC-007' },
    { id: 'LCC-037', name: 'ECWA Ibadan North LCC', type: 'LCC', parentId: 'DCC-007' },
    { id: 'LCC-038', name: 'ECWA Ibadan South LCC', type: 'LCC', parentId: 'DCC-007' },
    { id: 'LCC-039', name: 'ECWA Oyo LCC', type: 'LCC', parentId: 'DCC-007' },
    { id: 'LCC-040', name: 'ECWA Ogbomoso LCC', type: 'LCC', parentId: 'DCC-007' },
    
    // LCCs under Bauchi DCC
    { id: 'LCC-041', name: 'ECWA Bauchi Central LCC', type: 'LCC', parentId: 'DCC-008' },
    { id: 'LCC-042', name: 'ECWA Bauchi North LCC', type: 'LCC', parentId: 'DCC-008' },
    { id: 'LCC-043', name: 'ECWA Bauchi South LCC', type: 'LCC', parentId: 'DCC-008' },
    { id: 'LCC-044', name: 'ECWA Azare LCC', type: 'LCC', parentId: 'DCC-008' },
    { id: 'LCC-045', name: 'ECWA Misau LCC', type: 'LCC', parentId: 'DCC-008' },
    
    // LCCs under Maiduguri DCC
    { id: 'LCC-046', name: 'ECWA Maiduguri Central LCC', type: 'LCC', parentId: 'DCC-009' },
    { id: 'LCC-047', name: 'ECWA Maiduguri North LCC', type: 'LCC', parentId: 'DCC-009' },
    { id: 'LCC-048', name: 'ECWA Maiduguri South LCC', type: 'LCC', parentId: 'DCC-009' },
    { id: 'LCC-049', name: 'ECWA Biu LCC', type: 'LCC', parentId: 'DCC-009' },
    { id: 'LCC-050', name: 'ECWA Gwoza LCC', type: 'LCC', parentId: 'DCC-009' },
    
    // LCCs under Sokoto DCC
    { id: 'LCC-051', name: 'ECWA Sokoto Central LCC', type: 'LCC', parentId: 'DCC-010' },
    { id: 'LCC-052', name: 'ECWA Sokoto North LCC', type: 'LCC', parentId: 'DCC-010' },
    { id: 'LCC-053', name: 'ECWA Sokoto South LCC', type: 'LCC', parentId: 'DCC-010' },
    { id: 'LCC-054', name: 'ECWA Gusau LCC', type: 'LCC', parentId: 'DCC-010' },
    { id: 'LCC-055', name: 'ECWA Kebbi LCC', type: 'LCC', parentId: 'DCC-010' },
    
    // LCCs under Minna DCC
    { id: 'LCC-056', name: 'ECWA Minna Central LCC', type: 'LCC', parentId: 'DCC-011' },
    { id: 'LCC-057', name: 'ECWA Minna North LCC', type: 'LCC', parentId: 'DCC-011' },
    { id: 'LCC-058', name: 'ECWA Minna South LCC', type: 'LCC', parentId: 'DCC-011' },
    { id: 'LCC-059', name: 'ECWA Bida LCC', type: 'LCC', parentId: 'DCC-011' },
    { id: 'LCC-060', name: 'ECWA Suleja LCC', type: 'LCC', parentId: 'DCC-011' },
    
    // LCCs under Makurdi DCC
    { id: 'LCC-061', name: 'ECWA Makurdi Central LCC', type: 'LCC', parentId: 'DCC-012' },
    { id: 'LCC-062', name: 'ECWA Makurdi North LCC', type: 'LCC', parentId: 'DCC-012' },
    { id: 'LCC-063', name: 'ECWA Makurdi South LCC', type: 'LCC', parentId: 'DCC-012' },
    { id: 'LCC-064', name: 'ECWA Gboko LCC', type: 'LCC', parentId: 'DCC-012' },
    { id: 'LCC-065', name: 'ECWA Otukpo LCC', type: 'LCC', parentId: 'DCC-012' },
    
    // LCCs under Yola DCC
    { id: 'LCC-066', name: 'ECWA Yola Central LCC', type: 'LCC', parentId: 'DCC-013' },
    { id: 'LCC-067', name: 'ECWA Yola North LCC', type: 'LCC', parentId: 'DCC-013' },
    { id: 'LCC-068', name: 'ECWA Yola South LCC', type: 'LCC', parentId: 'DCC-013' },
    { id: 'LCC-069', name: 'ECWA Mubi LCC', type: 'LCC', parentId: 'DCC-013' },
    { id: 'LCC-070', name: 'ECWA Numan LCC', type: 'LCC', parentId: 'DCC-013' },
    
    // LCCs under Gombe DCC
    { id: 'LCC-071', name: 'ECWA Gombe Central LCC', type: 'LCC', parentId: 'DCC-014' },
    { id: 'LCC-072', name: 'ECWA Gombe North LCC', type: 'LCC', parentId: 'DCC-014' },
    { id: 'LCC-073', name: 'ECWA Gombe South LCC', type: 'LCC', parentId: 'DCC-014' },
    { id: 'LCC-074', name: 'ECWA Billiri LCC', type: 'LCC', parentId: 'DCC-014' },
    { id: 'LCC-075', name: 'ECWA Kaltungo LCC', type: 'LCC', parentId: 'DCC-014' },
    
    // LCCs under Damaturu DCC
    { id: 'LCC-076', name: 'ECWA Damaturu Central LCC', type: 'LCC', parentId: 'DCC-015' },
    { id: 'LCC-077', name: 'ECWA Damaturu North LCC', type: 'LCC', parentId: 'DCC-015' },
    { id: 'LCC-078', name: 'ECWA Damaturu South LCC', type: 'LCC', parentId: 'DCC-015' },
    { id: 'LCC-079', name: 'ECWA Potiskum LCC', type: 'LCC', parentId: 'DCC-015' },
    { id: 'LCC-080', name: 'ECWA Gashua LCC', type: 'LCC', parentId: 'DCC-015' },
  ]
  
  // Store the comprehensive data
  await kv.set(`org:index`, JSON.stringify(comprehensiveData))
  
  // Also store individual records
  for (const record of comprehensiveData) {
    await kv.set(`org:${record.id}`, JSON.stringify(record))
  }
  
  return comprehensiveData
}

export async function POST(req: Request) {
  const body = await req.json()
  const { id, name, type, parentId, address, phone } = body || {}
  if (!name || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  
  const raw = await kv.get(`org:index`)
  const index = raw ? JSON.parse(raw) as any[] : []
  const newId = id || `${type}-${Math.random().toString(36).slice(2,8)}`
  const rec = { 
    id: newId, 
    name, 
    type, 
    parentId,
    address: address || null,
    phone: phone || null,
    createdAt: new Date().toISOString()
  }
  
  index.push(rec)
  await kv.set(`org:index`, JSON.stringify(index))
  await kv.set(`org:${newId}`, JSON.stringify(rec))
  return NextResponse.json({ ok: true, org: rec })
}


