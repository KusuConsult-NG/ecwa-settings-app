export type OrgType = 'GCC' | 'DCC' | 'LCC' | 'LC'
export type Role =
  | 'President' | 'Vice President' | 'General Secretary' | 'Assistant GS' | 'Treasurer' | 'Financial Secretary'
  | 'Chairman' | 'Assistant Chairman' | 'LO' | 'Assistant LO' | 'Secretary' | 'Assistant Secretary'
  | 'Senior Minister' | 'Assistant Pastor' | 'Pastoral Team' | 'Elders' | 'CEL' | 'Treasurer LC' | 'Delegate'

export const rolesByOrg: Record<OrgType, string[]> = {
  GCC: ['President','Vice President','General Secretary','Assistant GS','Treasurer','Financial Secretary'],
  DCC: ['Chairman','Assistant Chairman','Secretary','Assistant Secretary','Treasurer','Delegate','Financial Secretary'],
  LCC: ['LO','Assistant LO','Secretary','Treasurer','Assistant Treasurer','Financial Secretary','Delegate'],
  LC: ['Senior Minister','Pastoral Team','Elders','Secretary','Assistant Secretary','Treasurer LC','Financial Secretary','CEL','Discipleship Elder'],
}

export const fullFinanceVisibility: string[] = [
  'Senior Minister','Secretary','Treasurer','Financial Secretary','Chairman','President','General Secretary','LO'
]


