export type TrainingPlan = {
  id: number
  name: string
  description?: string
  expectedDays: number
  status: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export type TrainingMainItem = {
  id: number
  trainingPlanId?: number
  title: string
  description?: string
  expectedDays: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type TrainingSubItem = {
  id: number
  mainItemId?: number
  title: string
  description?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type TrainingTodo = {
  id: number
  subItemId?: number
  title: string
  description?: string
  dayIndex?: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}
