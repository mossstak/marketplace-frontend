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
    <div className="flex justify-center items-center h-220">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border p-6 rounded border-black"
      >
        <h1 className="text-2xl font-semibold">Login</h1>

        {message && (
          <div className="text-red-500 whitespace-pre-wrap">{message}</div>
        )}

        <div className="flex flex-col space-y-2">
          <p className="font-bold">Email</p>
          <input
            className="w-full border rounded p-2 border-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label>Password</label>
          <input
            className="w-full border rounded p-2 border-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <button
          className="w-full border rounded p-2 cursor-pointer border-black focus:bg-gray-500 focus:text-white hover:border-white hover:bg-black hover:text-white "
          type="submit"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}

export default Login
