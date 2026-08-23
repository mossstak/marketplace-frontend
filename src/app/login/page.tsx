'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../api/api'
import { saveAuth, type Role } from '../../auth/auth'

type LoginResponse = {
  token: string
  role: Role
  email: string
  expiresAtUtc: string
}

const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await api.post<any>('/User/login', { email, password })

      console.log('LOGIN RESPONSE:', res.data)

      const token = res.data.token ?? res.data.Token

      const role =
        res.data.role ??
        res.data.Role ??
        res.data.roles?.[0] ??
        res.data.Roles?.[0]

      if (!token) throw new Error('No token returned from API')
      if (!role) throw new Error('No role returned from API')

      saveAuth(token, role)

      if (role === 'Admin') router.push('/admin/dashboard')
      else if (role === 'Seller') router.push('/seller/dashboard')
      else router.push('/buyer/dashboard')
    } catch (err: any) {
      const data = err?.response?.data
      setMessage(typeof data === 'string' ? data : 'Login failed.')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-5rem)] px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border p-6 sm:p-8 rounded-xl border-black dark:border-white/20 bg-white/70 dark:bg-zinc-900/70 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {message && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-3 rounded-lg whitespace-pre-wrap">{message}</div>
        )}

        <div className="flex flex-col space-y-1.5">
          <label className="font-semibold text-sm">Email</label>
          <input
            className="w-full border rounded-lg p-2.5 border-black/40 dark:border-white/30 bg-white/80 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="font-semibold text-sm">Password</label>
          <input
            className="w-full border rounded-lg p-2.5 border-black/40 dark:border-white/30 bg-white/80 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          className="w-full border rounded-lg p-2.5 cursor-pointer border-black bg-black text-white dark:bg-white dark:text-black font-semibold text-sm transition hover:opacity-90 active:scale-[0.99]"
          type="submit"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}

export default Login
