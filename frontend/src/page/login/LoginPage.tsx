import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '@/api/auth'
import { authAtom, setAuthFromResponse } from '@/hook/authAtoms'
import { getDefaultPathForRoles } from '@/lib/roleRouting'

const schema = z.object({
  companyName: z.string().min(1, '企業名は必須です'),
  loginId: z.string().min(1, 'ログインIDは必須です'),
  password: z.string().min(1, 'パスワードは必須です'),
})

type FormValues = z.infer<typeof schema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useSetAtom(authAtom)

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(setAuthFromResponse(data))
      const path = getDefaultPathForRoles(data.user.roles)
      navigate(path, { replace: true })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: '',
      loginId: '',
      password: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl ring-1 ring-slate-200">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">ログイン</h1>
        <p className="mb-6 text-sm text-slate-500">企業名 + ログインID + パスワードを入力してください。</p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">企業名</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              {...register('companyName')}
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">ログインID</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              {...register('loginId')}
            />
            {errors.loginId && <p className="mt-1 text-xs text-red-500">{errors.loginId.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">パスワード</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {mutation.error instanceof Error ? mutation.error.message : 'ログインに失敗しました'}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '認証中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
