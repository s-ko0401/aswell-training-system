import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import axios from 'axios'
import { listUsers } from '@/api/user'
import { SystemAdminLayout } from '@/components/layout/SystemAdminLayout'
import type { UserSummary } from '@/types/user'
import { format } from 'date-fns'

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

export const UsersPage = () => {
  const [keyword, setKeyword] = useState('')

  const usersQuery = useQuery({
    queryKey: ['users', keyword],
    queryFn: () => listUsers(keyword || undefined),
  })

  const listError = usersQuery.isError && usersQuery.error ? toErrorMessage(usersQuery.error) : null

  const users = useMemo<UserSummary[]>(() => usersQuery.data ?? [], [usersQuery.data])

  return (
    <SystemAdminLayout title="ユーザー管理">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="企業名・ログインID・氏名・メールで検索"
          className="w-full max-w-md rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
        {usersQuery.isFetching && <span className="text-xs text-slate-500">読み込み中...</span>}
      </div>

      {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">企業名</th>
              <th className="px-4 py-3">ログインID</th>
              <th className="px-4 py-3">氏名</th>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">権限</th>
              <th className="px-4 py-3">ステータス</th>
              <th className="px-4 py-3">作成日</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">{user.companyName}</td>
                <td className="px-4 py-3">{user.loginId}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">ID: {user.userId}</div>
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
                    {flagLabels[user.flag] ?? user.flag}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {user.createdAt ? format(new Date(user.createdAt), 'yyyy/MM/dd') : '—'}
                </td>
              </tr>
            ))}
            {users.length === 0 && !usersQuery.isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SystemAdminLayout>
  )
}
