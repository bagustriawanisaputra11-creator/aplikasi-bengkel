'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Wrench } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ nama_bengkel:'', email:'', password:'', no_telp:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const s = createClient()

  const daftar = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')

    // 1. Daftar auth
    const { data: auth, error: errAuth } = await s.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (errAuth) { setError(errAuth.message); setLoading(false); return }

    // 2. Buat tenant dengan trial 7 hari
    const { error: errTenant } = await s.from('tenants').insert({
      nama_bengkel: form.nama_bengkel,
      email: form.email,
      no_telp: form.no_telp,
      user_id: auth.user?.id,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    })
    if (errTenant) { setError(errTenant.message); setLoading(false); return }

    router.push('/login?success=Daftar berhasil, silakan login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Daftar Baru</h1>
          <p className="text-sm text-gray-500">Coba gratis 7 hari</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={daftar} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Bengkel</label>
            <input className="w-full px-4 py-3 border rounded-xl outline-none" required value={form.nama_bengkel} onChange={e=>setForm({...form,nama_bengkel:e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">No Telp</label>
            <input className="w-full px-4 py-3 border rounded-xl outline-none" value={form.no_telp} onChange={e=>setForm({...form,no_telp:e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input className="w-full px-4 py-3 border rounded-xl outline-none" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input className="w-full px-4 py-3 border rounded-xl outline-none" type="password" required minLength={6} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Tunggu...' : 'Daftar & Coba Gratis'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun? <a href="/login" className="text-blue-600 font-medium">Masuk</a>
        </p>
      </div>
    </div>
  )
}
