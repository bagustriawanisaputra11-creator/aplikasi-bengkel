'use client'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Wrench, Lock } from 'lucide-react'

export default function TrialExpired() {
  const router = useRouter()

  const logout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Trial Berakhir</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masa trial Anda sudah habis. Silakan hubungi kami untuk aktivasi.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700">Hubungi:</p>
          <p className="text-sm text-blue-600">0812-3456-7890</p>
          <p className="text-sm text-blue-600">admin@aplikasibengkel.com</p>
        </div>
        <button onClick={logout} className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800">
          Kembali ke Login
        </button>
      </div>
    </div>
  )
}
