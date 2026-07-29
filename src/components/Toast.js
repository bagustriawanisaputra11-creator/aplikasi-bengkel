'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export function showToast(message, type='success') {
  const event = new CustomEvent('toast', { detail: { message, type } })
  window.dispatchEvent(event)
}

export default function Toast() {
  const [toast, setToast] = useState(null)
  useEffect(() => {
    const handler = (e) => { setToast(e.detail); setTimeout(()=>setToast(null), 3000) }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [])
  if (!toast) return null
  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white ${toast.type==='success'?'bg-emerald-500':'bg-red-500'}`}>
        {toast.type==='success'?<CheckCircle className="w-5 h-5"/>:<XCircle className="w-5 h-5"/>}
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  )
}
