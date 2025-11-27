import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios from 'axios'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  createMainItem,
  createPlan,
  createSubItem,
  createTodo,
  deleteMainItem,
  deletePlan,
  deleteSubItem,
  deleteTodo,
  listMainItems,
  listPlans,
  listSubItems,
  listTodos,
  updateMainItem,
  updatePlan,
  updateSubItem,
  updateTodo,
} from '@/api/trainingTemplates'
import type { TrainingPlan, TrainingMainItem, TrainingSubItem, TrainingTodo } from '@/types/trainingTemplate'

const planSchema = z.object({
  name: z.string().min(1, '名称は必須です'),
  description: z.string().optional().or(z.literal('')),
  expectedDays: z.number().min(1, '日数は1以上'),
  status: z.union([z.literal(0), z.literal(1)]),
})

const mainSchema = z.object({
  title: z.string().min(1, '名称は必須です'),
  description: z.string().optional().or(z.literal('')),
  expectedDays: z.number().min(1),
  sortOrder: z.number().min(0),
})

const subSchema = z.object({
  title: z.string().min(1, '名称は必須です'),
  description: z.string().optional().or(z.literal('')),
  sortOrder: z.number().min(0),
})

const todoSchema = z.object({
  title: z.string().min(1, '名称は必須です'),
  description: z.string().optional().or(z.literal('')),
  dayIndex: z.number().optional(),
  sortOrder: z.number().min(0),
})

type PlanForm = z.infer<typeof planSchema>
type MainForm = z.infer<typeof mainSchema>
type SubForm = z.infer<typeof subSchema>
type TodoForm = z.infer<typeof todoSchema>

const toError = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message || err.message
  }
  if (err instanceof Error) return err.message
  return 'エラーが発生しました'
}

export const AdminTemplatePage = () => {
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)
  const [selectedMain, setSelectedMain] = useState<TrainingMainItem | null>(null)
  const [selectedSub, setSelectedSub] = useState<TrainingSubItem | null>(null)

  // Plans
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: () => listPlans() })

  const planForm = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', description: '', expectedDays: 1, status: 1 },
  })
  const mainForm = useForm<MainForm>({
    resolver: zodResolver(mainSchema),
    defaultValues: { title: '', description: '', expectedDays: 1, sortOrder: 0 },
  })
  const subForm = useForm<SubForm>({
    resolver: zodResolver(subSchema),
    defaultValues: { title: '', description: '', sortOrder: 0 },
  })
  const todoForm = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: '', description: '', dayIndex: undefined, sortOrder: 0 },
  })
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)

  const planMut = useMutation({
    mutationFn: (payload: { id?: number; data: PlanForm }) => {
      if (payload.id) return updatePlan(payload.id, payload.data)
      return createPlan(payload.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      planForm.reset({ name: '', description: '', expectedDays: 1, status: 1 })
    },
  })
  const planDeleteMut = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setSelectedPlan(null)
      setSelectedMain(null)
      setSelectedSub(null)
    },
  })

  // Main items
  const mainItemsQuery = useQuery({
    queryKey: ['mainItems', selectedPlan?.id],
    queryFn: () => (selectedPlan ? listMainItems(selectedPlan.id) : Promise.resolve([] as TrainingMainItem[])),
    enabled: !!selectedPlan,
  })
  const mainMut = useMutation({
    mutationFn: (payload: { id?: number; data: MainForm }) => {
      if (!selectedPlan) throw new Error('Plan not selected')
      const req = { ...payload.data, trainingPlanId: selectedPlan.id }
      if (payload.id) return updateMainItem(payload.id, req)
      return createMainItem(req)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mainItems', selectedPlan?.id] })
      mainForm.reset({ title: '', description: '', expectedDays: 1, sortOrder: 0 })
    },
  })
  const mainDeleteMut = useMutation({
    mutationFn: deleteMainItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mainItems', selectedPlan?.id] })
      setSelectedMain(null)
      setSelectedSub(null)
    },
  })

  // Sub items
  const subItemsQuery = useQuery({
    queryKey: ['subItems', selectedMain?.id],
    queryFn: () => (selectedMain ? listSubItems(selectedMain.id) : Promise.resolve([] as TrainingSubItem[])),
    enabled: !!selectedMain,
  })
  const subMut = useMutation({
    mutationFn: (payload: { id?: number; data: SubForm }) => {
      if (!selectedMain) throw new Error('Main item not selected')
      const req = { ...payload.data, mainItemId: selectedMain.id }
      if (payload.id) return updateSubItem(payload.id, req)
      return createSubItem(req)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subItems', selectedMain?.id] })
      subForm.reset({ title: '', description: '', sortOrder: 0 })
    },
  })
  const subDeleteMut = useMutation({
    mutationFn: deleteSubItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subItems', selectedMain?.id] })
      setSelectedSub(null)
    },
  })

  // Todos
  const todosQuery = useQuery({
    queryKey: ['todos', selectedSub?.id],
    queryFn: () => (selectedSub ? listTodos(selectedSub.id) : Promise.resolve([] as TrainingTodo[])),
    enabled: !!selectedSub,
  })
  const todoMut = useMutation({
    mutationFn: (payload: { id?: number; data: TodoForm }) => {
      if (!selectedSub) throw new Error('Sub item not selected')
      const req = { ...payload.data, subItemId: selectedSub.id }
      if (payload.id) return updateTodo(payload.id, req)
      return createTodo(req)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', selectedSub?.id] })
      todoForm.reset({ title: '', description: '', dayIndex: undefined, sortOrder: 0 })
      setEditingTodoId(null)
    },
  })
  const todoDeleteMut = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', selectedSub?.id] }),
  })

  const plans = plansQuery.data || []
  const mainItems = mainItemsQuery.data || []
  const subItems = subItemsQuery.data || []
  const todos = todosQuery.data || []

  return (
    <AdminLayout title="研修テンプレ">
      <div className="space-y-8">
        {/* Plans */}
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">研修計画</h2>
            <div className="space-x-2">
              <button
                className="rounded-md border border-slate-200 px-3 py-1 text-sm"
                onClick={() => planForm.reset({ name: '', description: '', expectedDays: 1, status: 1 })}
              >
                新規
              </button>
              <button
                className="rounded-md bg-slate-900 px-3 py-1 text-sm font-semibold text-white"
                onClick={planForm.handleSubmit((data) =>
                  planMut.mutate({ id: selectedPlan?.id, data: { ...data, description: data.description || undefined } })
                )}
              >
                {selectedPlan ? '更新' : '追加'}
              </button>
            </div>
          </div>
          {planMut.isError && <p className="text-xs text-red-500">{toError(planMut.error)}</p>}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 text-sm text-slate-700">
              <label className="text-xs text-slate-600">名称 *</label>
              <input className="w-full rounded-md border border-slate-200 px-3 py-2" {...planForm.register('name')} />
              <label className="text-xs text-slate-600">説明</label>
              <textarea className="w-full rounded-md border border-slate-200 px-3 py-2" rows={3} {...planForm.register('description')} />
              <label className="text-xs text-slate-600">予定日数 *</label>
              <input type="number" className="w-full rounded-md border border-slate-200 px-3 py-2" {...planForm.register('expectedDays', { valueAsNumber: true })} />
              <label className="text-xs text-slate-600">ステータス (0:停用,1:啟用)</label>
              <select className="w-full rounded-md border border-slate-200 px-3 py-2" {...planForm.register('status', { valueAsNumber: true })}>
                <option value={1}>啟用</option>
                <option value={0}>停用</option>
              </select>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">名称</th>
                    <th className="px-3 py-2">日数</th>
                    <th className="px-3 py-2">状態</th>
                    <th className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">{p.expectedDays}</td>
                      <td className="px-3 py-2">{p.status === 1 ? '啟用' : '停用'}</td>
                      <td className="space-x-2 px-3 py-2 text-xs">
                        <button
                        className="rounded-md border border-slate-200 px-2 py-1"
                        onClick={() => {
                          setSelectedPlan(p)
                          setSelectedMain(null)
                          setSelectedSub(null)
                          setEditingTodoId(null)
                          planForm.reset({
                            name: p.name,
                            description: p.description || '',
                            expectedDays: p.expectedDays,
                            status: p.status as 0 | 1,
                            })
                          }}
                        >
                          選択
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-2 py-1 text-red-600"
                          onClick={() => planDeleteMut.mutate(p.id)}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-center text-slate-500" colSpan={4}>
                        データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Main items */}
        {selectedPlan && (
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">大項目 ({selectedPlan.name})</h2>
              <div className="space-x-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm"
                  onClick={() => mainForm.reset({ title: '', description: '', expectedDays: 1, sortOrder: 0 })}
                >
                  新規
                </button>
                <button
                  className="rounded-md bg-slate-900 px-3 py-1 text-sm font-semibold text-white"
                  onClick={mainForm.handleSubmit((data) =>
                    mainMut.mutate({ id: selectedMain?.id, data: { ...data, description: data.description || undefined } })
                  )}
                >
                  {selectedMain ? '更新' : '追加'}
                </button>
              </div>
            </div>
            {mainMut.isError && <p className="text-xs text-red-500">{toError(mainMut.error)}</p>}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-700">
                <label className="text-xs text-slate-600">名称 *</label>
                <input className="w-full rounded-md border border-slate-200 px-3 py-2" {...mainForm.register('title')} />
                <label className="text-xs text-slate-600">説明</label>
                <textarea className="w-full rounded-md border border-slate-200 px-3 py-2" rows={2} {...mainForm.register('description')} />
                <label className="text-xs text-slate-600">予定日数 *</label>
                <input type="number" className="w-full rounded-md border border-slate-200 px-3 py-2" {...mainForm.register('expectedDays', { valueAsNumber: true })} />
                <label className="text-xs text-slate-600">表示順 *</label>
                <input type="number" className="w-full rounded-md border border-slate-200 px-3 py-2" {...mainForm.register('sortOrder', { valueAsNumber: true })} />
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">名称</th>
                      <th className="px-3 py-2">日数</th>
                      <th className="px-3 py-2">順番</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainItems.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="px-3 py-2">{m.title}</td>
                        <td className="px-3 py-2">{m.expectedDays}</td>
                        <td className="px-3 py-2">{m.sortOrder}</td>
                        <td className="space-x-2 px-3 py-2 text-xs">
                          <button
                            className="rounded-md border border-slate-200 px-2 py-1"
                            onClick={() => {
                              setSelectedMain(m)
                              setSelectedSub(null)
                              setEditingTodoId(null)
                              mainForm.reset({
                                title: m.title,
                                description: m.description || '',
                                expectedDays: m.expectedDays,
                                sortOrder: m.sortOrder,
                              })
                            }}
                          >
                            選択
                          </button>
                          <button
                            className="rounded-md border border-red-200 px-2 py-1 text-red-600"
                            onClick={() => mainDeleteMut.mutate(m.id)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                    {mainItems.length === 0 && (
                      <tr>
                        <td className="px-3 py-4 text-center text-slate-500" colSpan={4}>
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Sub items */}
        {selectedMain && (
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">小項目 ({selectedMain.title})</h2>
              <div className="space-x-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm"
                  onClick={() => subForm.reset({ title: '', description: '', sortOrder: 0 })}
                >
                  新規
                </button>
                <button
                  className="rounded-md bg-slate-900 px-3 py-1 text-sm font-semibold text-white"
                  onClick={subForm.handleSubmit((data) =>
                    subMut.mutate({ id: selectedSub?.id, data: { ...data, description: data.description || undefined } })
                  )}
                >
                  {selectedSub ? '更新' : '追加'}
                </button>
              </div>
            </div>
            {subMut.isError && <p className="text-xs text-red-500">{toError(subMut.error)}</p>}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-700">
                <label className="text-xs text-slate-600">名称 *</label>
                <input className="w-full rounded-md border border-slate-200 px-3 py-2" {...subForm.register('title')} />
                <label className="text-xs text-slate-600">説明</label>
                <textarea className="w-full rounded-md border border-slate-200 px-3 py-2" rows={2} {...subForm.register('description')} />
                <label className="text-xs text-slate-600">表示順 *</label>
                <input type="number" className="w-full rounded-md border border-slate-200 px-3 py-2" {...subForm.register('sortOrder', { valueAsNumber: true })} />
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">名称</th>
                      <th className="px-3 py-2">順番</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subItems.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-3 py-2">{s.title}</td>
                        <td className="px-3 py-2">{s.sortOrder}</td>
                        <td className="space-x-2 px-3 py-2 text-xs">
                          <button
                            className="rounded-md border border-slate-200 px-2 py-1"
                            onClick={() => {
                              setSelectedSub(s)
                              setEditingTodoId(null)
                              subForm.reset({
                                title: s.title,
                                description: s.description || '',
                                sortOrder: s.sortOrder,
                              })
                            }}
                          >
                            選択
                          </button>
                          <button
                            className="rounded-md border border-red-200 px-2 py-1 text-red-600"
                            onClick={() => subDeleteMut.mutate(s.id)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subItems.length === 0 && (
                      <tr>
                        <td className="px-3 py-4 text-center text-slate-500" colSpan={3}>
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Todos */}
        {selectedSub && (
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">TODO ({selectedSub.title})</h2>
              <div className="space-x-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm"
                  onClick={() => todoForm.reset({ title: '', description: '', dayIndex: undefined, sortOrder: 0 })}
                >
                  新規
                </button>
                <button
                  className="rounded-md bg-slate-900 px-3 py-1 text-sm font-semibold text-white"
                  onClick={todoForm.handleSubmit((data) =>
                    todoMut.mutate({
                      id: editingTodoId ?? undefined,
                      data: { ...data, description: data.description || undefined },
                    })
                  )}
                >
                  {editingTodoId ? '更新' : '追加'}
                </button>
              </div>
            </div>
            {todoMut.isError && <p className="text-xs text-red-500">{toError(todoMut.error)}</p>}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-700">
                <label className="text-xs text-slate-600">名称 *</label>
                <input className="w-full rounded-md border border-slate-200 px-3 py-2" {...todoForm.register('title')} />
                <label className="text-xs text-slate-600">説明</label>
                <textarea className="w-full rounded-md border border-slate-200 px-3 py-2" rows={2} {...todoForm.register('description')} />
                <label className="text-xs text-slate-600">Day Index</label>
                <input type="number" className="w-full rounded-md border border-slate-200 px-3 py-2" {...todoForm.register('dayIndex', { valueAsNumber: true })} />
                <label className="text-xs text-slate-600">表示順 *</label>
                <input type="number" className="w-full rounded-md border border-slate-200 px-3 py-2" {...todoForm.register('sortOrder', { valueAsNumber: true })} />
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">名称</th>
                      <th className="px-3 py-2">順番</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map((t) => (
                      <tr key={t.id} className="border-t">
                        <td className="px-3 py-2">{t.title}</td>
                        <td className="px-3 py-2">{t.sortOrder}</td>
                        <td className="space-x-2 px-3 py-2 text-xs">
                          <button
                            className="rounded-md border border-slate-200 px-2 py-1"
                            onClick={() => {
                              setEditingTodoId(t.id)
                              todoForm.reset({
                                title: t.title,
                                description: t.description || '',
                                dayIndex: t.dayIndex ?? undefined,
                                sortOrder: t.sortOrder,
                              })
                            }}
                          >
                            編集
                          </button>
                          <button
                            className="rounded-md border border-red-200 px-2 py-1 text-red-600"
                            onClick={() => todoDeleteMut.mutate(t.id)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                    {todos.length === 0 && (
                      <tr>
                        <td className="px-3 py-4 text-center text-slate-500" colSpan={3}>
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}
