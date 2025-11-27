import { api } from './client'
import type { TrainingPlan, TrainingMainItem, TrainingSubItem, TrainingTodo } from '@/types/trainingTemplate'

export const listPlans = async (keyword?: string) => {
  const { data } = await api.get<TrainingPlan[]>('/training/plans', { params: { keyword } })
  return data
}

export const createPlan = async (payload: {
  name: string
  description?: string
  expectedDays: number
  status: number
}) => {
  const { data } = await api.post<TrainingPlan>('/training/plans', payload)
  return data
}

export const updatePlan = async (id: number, payload: {
  name: string
  description?: string
  expectedDays: number
  status: number
}) => {
  const { data } = await api.put<TrainingPlan>(`/training/plans/${id}`, payload)
  return data
}

export const deletePlan = async (id: number) => {
  await api.delete(`/training/plans/${id}`)
}

export const listMainItems = async (planId: number) => {
  const { data } = await api.get<TrainingMainItem[]>(`/training/plans/${planId}/main-items`)
  return data.map((i) => ({ ...i, trainingPlanId: planId }))
}

export const createMainItem = async (payload: {
  trainingPlanId: number
  title: string
  description?: string
  expectedDays: number
  sortOrder: number
}) => {
  const { data } = await api.post<TrainingMainItem>('/training/main-items', payload)
  return { ...data, trainingPlanId: payload.trainingPlanId }
}

export const updateMainItem = async (id: number, payload: {
  trainingPlanId: number
  title: string
  description?: string
  expectedDays: number
  sortOrder: number
}) => {
  const { data } = await api.put<TrainingMainItem>(`/training/main-items/${id}`, payload)
  return { ...data, trainingPlanId: payload.trainingPlanId }
}

export const deleteMainItem = async (id: number) => {
  await api.delete(`/training/main-items/${id}`)
}

export const listSubItems = async (mainItemId: number) => {
  const { data } = await api.get<TrainingSubItem[]>(`/training/main-items/${mainItemId}/sub-items`)
  return data.map((i) => ({ ...i, mainItemId }))
}

export const createSubItem = async (payload: {
  mainItemId: number
  title: string
  description?: string
  sortOrder: number
}) => {
  const { data } = await api.post<TrainingSubItem>('/training/sub-items', payload)
  return { ...data, mainItemId: payload.mainItemId }
}

export const updateSubItem = async (id: number, payload: {
  mainItemId: number
  title: string
  description?: string
  sortOrder: number
}) => {
  const { data } = await api.put<TrainingSubItem>(`/training/sub-items/${id}`, payload)
  return { ...data, mainItemId: payload.mainItemId }
}

export const deleteSubItem = async (id: number) => {
  await api.delete(`/training/sub-items/${id}`)
}

export const listTodos = async (subItemId: number) => {
  const { data } = await api.get<TrainingTodo[]>(`/training/sub-items/${subItemId}/todos`)
  return data.map((t) => ({ ...t, subItemId }))
}

export const createTodo = async (payload: {
  subItemId: number
  title: string
  description?: string
  dayIndex?: number
  sortOrder: number
}) => {
  const { data } = await api.post<TrainingTodo>('/training/todos', payload)
  return { ...data, subItemId: payload.subItemId }
}

export const updateTodo = async (id: number, payload: {
  subItemId: number
  title: string
  description?: string
  dayIndex?: number
  sortOrder: number
}) => {
  const { data } = await api.put<TrainingTodo>(`/training/todos/${id}`, payload)
  return { ...data, subItemId: payload.subItemId }
}

export const deleteTodo = async (id: number) => {
  await api.delete(`/training/todos/${id}`)
}
