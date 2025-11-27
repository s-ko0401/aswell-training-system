import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios from 'axios'
import { createRole, deleteRole, listRoles, updateRole } from '@/api/role'
import { SystemAdminLayout } from '@/components/layout/SystemAdminLayout'
import type { Role } from '@/types/role'

const createSchema = z.object({
  code: z.string().min(1, 'コードは必須です'),
  nameJa: z.string().min(1, '名称は必須です'),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
})

const updateSchema = z.object({
  code: z.string().min(1, 'コードは必須です'),
  nameJa: z.string().min(1, '名称は必須です'),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
})

type CreateValues = z.infer<typeof createSchema>
type UpdateValues = z.infer<typeof updateSchema>

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || error.message
  }
  if (error instanceof Error) return error.message
  return 'エラーが発生しました'
}

export const RolesPage = () => {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Role | null>(null)

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
  })

  const listError =
    rolesQuery.isError && rolesQuery.error ? toErrorMessage(rolesQuery.error) : null

  const createMut = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      createForm.reset()
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload: { roleId: number; data: UpdateValues }) => updateRole(payload.roleId, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setEditing(null)
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: '',
      nameJa: '',
      description: '',
      sortOrder: undefined,
    },
  })

  const updateForm = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
  })

  const onCreateSubmit = (values: CreateValues) => createMut.mutate(values)

  const onUpdateSubmit = (values: UpdateValues) => {
    if (!editing) return
    updateMut.mutate({ roleId: editing.roleId, data: values })
  }

  return (
    <SystemAdminLayout title="権限管理">
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">コード</th>
                  <th className="px-4 py-3">名称</th>
                  <th className="px-4 py-3">説明</th>
                  <th className="px-4 py-3">順番</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {rolesQuery.data?.map((role) => (
                  <tr key={role.roleId} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-xs text-slate-500">{role.roleId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{role.code}</td>
                    <td className="px-4 py-3">{role.nameJa}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{role.description || '—'}</td>
                    <td className="px-4 py-3 text-sm">{role.sortOrder ?? '—'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        onClick={() => {
                          setEditing(role)
                          updateForm.reset({
                            code: role.code,
                            nameJa: role.nameJa,
                            description: role.description ?? '',
                            sortOrder: role.sortOrder ?? undefined,
                          })
                        }}
                      >
                        編集
                      </button>
                      <button
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                        onClick={() => deleteMut.mutate(role.roleId)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
                {rolesQuery.data?.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">権限を追加</h3>
            <form className="mt-3 space-y-3" onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <div>
                <label className="text-xs font-medium text-slate-600">コード *</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('code')}
                />
                {createForm.formState.errors.code && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.code.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">名称 *</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('nameJa')}
                />
                {createForm.formState.errors.nameJa && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.nameJa.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">説明</label>
                <textarea
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  rows={3}
                  {...createForm.register('description')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">順番</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('sortOrder', { valueAsNumber: true })}
                />
              </div>
              {createMut.isError && (
                <p className="text-xs text-red-500">
                  {createMut.error ? toErrorMessage(createMut.error) : '作成に失敗しました'}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={createMut.isPending}
              >
                {createMut.isPending ? '作成中...' : '追加'}
              </button>
            </form>
          </div>

          {editing && (
            <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">権限を編集</h3>
                <button className="text-xs text-slate-500" onClick={() => setEditing(null)}>
                  閉じる
                </button>
              </div>
              <form className="mt-3 space-y-3" onSubmit={updateForm.handleSubmit(onUpdateSubmit)}>
                <div>
                  <label className="text-xs font-medium text-slate-600">コード *</label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...updateForm.register('code')}
                  />
                  {updateForm.formState.errors.code && (
                    <p className="text-xs text-red-500">{updateForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">名称 *</label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...updateForm.register('nameJa')}
                  />
                  {updateForm.formState.errors.nameJa && (
                    <p className="text-xs text-red-500">{updateForm.formState.errors.nameJa.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">説明</label>
                  <textarea
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    rows={3}
                    {...updateForm.register('description')}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">順番</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...updateForm.register('sortOrder', { valueAsNumber: true })}
                />
              </div>
                {updateMut.isError && (
                  <p className="text-xs text-red-500">
                    {updateMut.error ? toErrorMessage(updateMut.error) : '更新に失敗しました'}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={updateMut.isPending}
                  >
                    {updateMut.isPending ? '更新中...' : '更新'}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
                    onClick={() => setEditing(null)}
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </SystemAdminLayout>
  )
}
