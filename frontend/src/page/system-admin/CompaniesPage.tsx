import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios from 'axios'
import { createCompany, deleteCompany, listCompanies, updateCompany } from '@/api/company'
import { SystemAdminLayout } from '@/components/layout/SystemAdminLayout'
import type { Company } from '@/types/company'
import { format } from 'date-fns'

const createSchema = z.object({
  companyName: z.string().min(1, '企業名は必須です'),
  billingEmail: z.string().email().optional().or(z.literal('')),
  adminLoginId: z.string().min(1, '管理者ログインIDは必須です'),
  adminPassword: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  adminName: z.string().min(1, '管理者名は必須です'),
  adminEmail: z.string().email().optional().or(z.literal('')),
})

const updateSchema = z.object({
  companyName: z.string().min(1, '企業名は必須です'),
  billingEmail: z.string().email().optional().or(z.literal('')),
  flag: z.union([z.literal(0), z.literal(1), z.literal(9)]),
})

type CreateFormValues = z.infer<typeof createSchema>
type UpdateFormValues = z.infer<typeof updateSchema>

const flagLabels: Record<number, string> = {
  0: '利用中',
  1: '停止',
  9: '削除',
}

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || error.message
  }
  if (error instanceof Error) return error.message
  return 'エラーが発生しました'
}

export const CompaniesPage = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState<Company | null>(null)

  const companiesQuery = useQuery({
    queryKey: ['companies', keyword],
    queryFn: () => listCompanies(keyword || undefined),
  })

  const listError =
    companiesQuery.isError && companiesQuery.error ? toErrorMessage(companiesQuery.error) : null

  const createMut = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      createForm.reset()
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; data: UpdateFormValues }) => updateCompany(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setEditing(null)
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      companyName: '',
      billingEmail: '',
      adminLoginId: '',
      adminPassword: '',
      adminName: '',
      adminEmail: '',
    },
  })

  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
  })

  const onCreateSubmit = (values: CreateFormValues) => {
    createMut.mutate(values)
  }

  const onUpdateSubmit = (values: UpdateFormValues) => {
    if (!editing) return
    updateMut.mutate({ id: editing.companyId, data: values })
  }

  const filteredCompanies = useMemo(() => companiesQuery.data || [], [companiesQuery.data])

  return (
    <SystemAdminLayout title="企業管理">
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="企業名・メールで検索"
              className="w-full max-w-sm rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
            {companiesQuery.isFetching && <span className="text-xs text-slate-500">読み込み中...</span>}
          </div>

          {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">企業名</th>
                  <th className="px-4 py-3">メール</th>
                  <th className="px-4 py-3">ステータス</th>
                  <th className="px-4 py-3">作成日</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.companyId} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">{company.companyName}</td>
                    <td className="px-4 py-3">{company.billingEmail || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {flagLabels[company.flag] ?? company.flag}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {company.createdAt ? format(new Date(company.createdAt), 'yyyy/MM/dd') : '—'}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        onClick={() => {
                          setEditing(company)
                          updateForm.reset({
                            companyName: company.companyName,
                            billingEmail: company.billingEmail || '',
                            flag: company.flag,
                          })
                        }}
                      >
                        編集
                      </button>
                      <button
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                        onClick={() => deleteMut.mutate(company.companyId)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && !companiesQuery.isLoading && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
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
            <h3 className="text-lg font-semibold text-slate-900">企業を新規登録</h3>
            <p className="mb-4 text-xs text-slate-500">同時に管理者アカウントを作成します。</p>
            <form className="space-y-3" onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <div>
                <label className="text-xs font-medium text-slate-600">企業名 *</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('companyName')}
                />
                {createForm.formState.errors.companyName && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.companyName.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">請求メール</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('billingEmail')}
                />
                {createForm.formState.errors.billingEmail && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.billingEmail.message}</p>
                )}
              </div>
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-sm font-semibold text-slate-800">管理者アカウント</h4>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">ログインID *</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('adminLoginId')}
                />
                {createForm.formState.errors.adminLoginId && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.adminLoginId.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">パスワード *</label>
                <input
                  type="password"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('adminPassword')}
                />
                {createForm.formState.errors.adminPassword && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.adminPassword.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">氏名 *</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('adminName')}
                />
                {createForm.formState.errors.adminName && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.adminName.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">メール</label>
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  {...createForm.register('adminEmail')}
                />
                {createForm.formState.errors.adminEmail && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.adminEmail.message}</p>
                )}
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
                {createMut.isPending ? '作成中...' : '企業を作成'}
              </button>
            </form>
          </div>

          {editing && (
            <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">企業を編集</h3>
                <button className="text-xs text-slate-500" onClick={() => setEditing(null)}>
                  閉じる
                </button>
              </div>
              <form className="mt-4 space-y-3" onSubmit={updateForm.handleSubmit(onUpdateSubmit)}>
                <div>
                  <label className="text-xs font-medium text-slate-600">企業名 *</label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...updateForm.register('companyName')}
                  />
                  {updateForm.formState.errors.companyName && (
                    <p className="text-xs text-red-500">{updateForm.formState.errors.companyName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">請求メール</label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...updateForm.register('billingEmail')}
                  />
                  {updateForm.formState.errors.billingEmail && (
                    <p className="text-xs text-red-500">{updateForm.formState.errors.billingEmail.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">ステータス</label>
                  <select
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...updateForm.register('flag', { valueAsNumber: true })}
                  >
                    <option value={0}>利用中</option>
                    <option value={1}>停止</option>
                    <option value={9}>削除</option>
                  </select>
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
