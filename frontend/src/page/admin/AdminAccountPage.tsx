import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createUser, listUsers, updateUser } from '@/api/user'
import type { UserSummary } from '@/types/user'
import { format } from 'date-fns'
import axios from 'axios'

const schema = z.object({
  loginId: z.string().min(1, 'ログインIDは必須です'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  name: z.string().min(1, '氏名は必須です'),
  email: z.string().email().optional().or(z.literal('')),
  roleCode: z.enum(['ADMIN', 'TRAINER', 'TRAINEE']),
  teacherId: z.string().optional(),
  flag: z.union([z.literal(0), z.literal(1), z.literal(9)]).optional(),
})

type FormValues = z.infer<typeof schema>

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || error.message
  }
  if (error instanceof Error) return error.message
  return 'エラーが発生しました'
}

export const AdminAccountPage = () => {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSlideIn, setDrawerSlideIn] = useState(false)
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null)
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'TRAINER' | 'TRAINEE'>('ALL')
  const [flagFilter, setFlagFilter] = useState<'ALL' | '0' | '1' | '9'>('ALL')
  const usersQuery = useQuery({
    queryKey: ['users', keyword],
    queryFn: () => listUsers(keyword || undefined),
  })

  const filteredUsers = useMemo(() => {
    let list = usersQuery.data || []
    if (roleFilter !== 'ALL') {
      list = list.filter((u) => u.roles.includes(roleFilter))
    }
    if (flagFilter !== 'ALL') {
      const f = Number(flagFilter)
      list = list.filter((u) => u.flag === f)
    }
    return list
  }, [usersQuery.data, roleFilter, flagFilter])

  const trainers = useMemo(
    () => (usersQuery.data || []).filter((u) => u.roles.includes('TRAINER')),
    [usersQuery.data],
  )

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      form.reset({ loginId: '', password: '', name: '', email: '', roleCode: 'TRAINER', teacherId: undefined, flag: 0 })
      setDrawerOpen(false)
      setEditingUser(null)
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload: { userId: string; data: FormValues }) => {
      const { userId, data } = payload
      return updateUser(userId, {
        name: data.name,
        email: data.email?.trim() || undefined,
        roleCode: data.roleCode,
        teacherId: data.roleCode === 'TRAINEE' ? data.teacherId : undefined,
        flag: data.flag,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      form.reset({ loginId: '', password: '', name: '', email: '', roleCode: 'TRAINER', teacherId: undefined, flag: 0 })
      setDrawerOpen(false)
      setEditingUser(null)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loginId: '',
      password: '',
      name: '',
      email: '',
      roleCode: 'TRAINER',
      teacherId: undefined,
      flag: 0,
    },
  })

  const watchRole = form.watch('roleCode')

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      email: values.email?.trim() || undefined,
      teacherId: values.roleCode === 'TRAINEE' ? values.teacherId : undefined,
    }
    if (editingUser) {
      updateMut.mutate({ userId: editingUser.userId, data: values })
    } else {
      createMut.mutate(payload)
    }
  }

  const openDrawer = (user?: UserSummary | null) => {
    setEditingUser(user ?? null)
    setDrawerOpen(true)
    setDrawerSlideIn(false)
    requestAnimationFrame(() => setDrawerSlideIn(true))
  }

  const closeDrawer = () => {
    setDrawerSlideIn(false)
    setTimeout(() => setDrawerOpen(false), 250)
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">アカウント管理</h1>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            form.reset({ loginId: '', password: '', name: '', email: '', roleCode: 'TRAINER', teacherId: undefined, flag: 0 })
            openDrawer(null)
          }}
        >
          人員を追加
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <div>
          <label className="text-xs text-slate-600">権限</label>
          <select
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          >
            <option value="ALL">すべて</option>
            <option value="ADMIN">管理者</option>
            <option value="TRAINER">教育担当者</option>
            <option value="TRAINEE">研修者</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600"></label>
          <select
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value as typeof flagFilter)}
          >
            <option value="ALL">すべて</option>
            <option value="0">利用中</option>
            <option value="1">停止</option>
            <option value="9">削除</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px] max-w-[600px]">
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="氏名・ログインID・メールなど"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ログインID</th>
                  <th className="px-4 py-3">氏名</th>
                  <th className="px-4 py-3">メール</th>
                  <th className="px-4 py-3">権限</th>
                  <th className="px-4 py-3">ステータス</th>
                  <th className="px-4 py-3">作成日</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">{user.loginId}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                    </td>
                    <td className="px-4 py-3">{user.email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <span key={role} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {user.flag === 0 ? '利用中' : user.flag === 1 ? '停止' : '削除'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {user.createdAt ? format(new Date(user.createdAt), 'yyyy/MM/dd') : '—'}
                    </td>
                    <td className="px-4 py-3 space-x-2 text-xs">
                      <button
                        className="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => {
                          const role =
                            user.roles.includes('ADMIN') ? 'ADMIN' : user.roles.includes('TRAINER') ? 'TRAINER' : 'TRAINEE'
                          form.reset({
                            loginId: user.loginId,
                            password: '********',
                            name: user.name,
                            email: user.email || '',
                            roleCode: role,
                            teacherId: undefined,
                            flag: (user.flag as 0 | 1 | 9) ?? 0,
                          })
                          openDrawer(user)
                        }}
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={closeDrawer}>
          <div
            className={`h-full w-full max-w-md transform bg-white shadow-2xl ring-1 ring-slate-200 transition-transform duration-300 ${
              drawerSlideIn ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingUser ? '人員を編集' : '人員を追加'}
              </h3>
              <button className="text-sm text-slate-500 hover:text-slate-700" onClick={closeDrawer}>
                閉じる
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">
              <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                <div>
                  <label className="text-xs font-medium text-slate-600">ログインID *</label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...form.register('loginId')}
                    disabled={!!editingUser}
                  />
                  {form.formState.errors.loginId && (
                    <p className="text-xs text-red-500">{form.formState.errors.loginId.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">パスワード *</label>
                  <input
                    type="password"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...form.register('password')}
                    disabled={!!editingUser}
                  />
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">氏名 *</label>
                  <input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">メール</label>
                  <input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" {...form.register('email')} />
                  {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">権限 *</label>
                  <select
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...form.register('roleCode')}
                  >
                    <option value="ADMIN">管理者</option>
                    <option value="TRAINER">教育担当者</option>
                    <option value="TRAINEE">研修者</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">ステータス (0:利用中, 1:停止, 9:削除)</label>
                  <select
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    {...form.register('flag')}
                  >
                    <option value={0}>利用中</option>
                    <option value={1}>停止</option>
                    <option value={9}>削除</option>
                  </select>
                </div>

                {watchRole === 'TRAINEE' && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">担当する教育者 *</label>
                    <select
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      {...form.register('teacherId', { required: true })}
                    >
                      <option value="">選択してください</option>
                      {trainers.map((t) => (
                        <option key={t.userId} value={t.userId}>
                          {t.name} ({t.loginId})
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.teacherId && <p className="text-xs text-red-500">教育担当者を選択してください</p>}
                  </div>
                )}

                {(createMut.isError || updateMut.isError) && (
                  <p className="text-xs text-red-500">
                    {createMut.error
                      ? toErrorMessage(createMut.error)
                      : updateMut.error
                        ? toErrorMessage(updateMut.error)
                        : '保存に失敗しました'}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={createMut.isPending || updateMut.isPending}
                >
                  {createMut.isPending || updateMut.isPending ? '保存中...' : editingUser ? '更新する' : '人員を追加'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
