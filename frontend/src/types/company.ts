export type CompanyFlag = 0 | 1 | 9

export interface Company {
  companyId: string
  companyName: string
  billingEmail?: string | null
  flag: CompanyFlag
  createdAt: string
  updatedAt: string
}
