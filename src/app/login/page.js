'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Wrench } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const s = createClient()

  const login = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await s.auth.signInWithPassword({ email, password: pass })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Aplikasi Bengkel</h1>
          <p className="text-sm text-gray-500">Masuk ke akun Anda</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input className="w-full px-4 py-3 border rounded-xl outline-none" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input className="w-full px-4 py-3 border rounded-xl outline-none" type="password" required value={pass} onChange={e=>setPass(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Loading...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun? <a href="/register" className="text-blue-600 font-medium">Daftar</a>
        </p>
      </div>
    </div>
  )
}
