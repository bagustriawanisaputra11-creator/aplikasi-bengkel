'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Settings, Save } from 'lucide-react'
import { showToast } from '@/components/Toast'

export default function Pengaturan() {
  const [form, setForm] = useState({ nama_bengkel:'', alamat:'', no_telp:'', logo:'' })
  const s = createClient()

  useEffect(() => {
    (async () => {
      const { data } = await s.from('tenants').select('*').limit(1).single()
      if (data) setForm(data)
    })()
  }, [])

  const save = async () => {
    const { data: tn } = await s.from('tenants').select('id').limit(1).single()
    if (tn) await s.from('tenants').update(form).eq('id', tn.id)
    else await s.from('tenants').insert(form)
    showToast('Pengaturan disimpan!','success')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Settings className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Pengaturan</h1><p className="text-xs text-gray-500">Setting profil bengkel</p></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-xl">
        <div className="space-y-4">
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Nama Bengkel</label>
            <input className="w-full px-4 py-2.5 border rounded-xl outline-none" value={form.nama_bengkel} onChange={e=>setForm({...form,nama_bengkel:e.target.value})} /></div>
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">No Telp</label>
            <input className="w-full px-4 py-2.5 border rounded-xl outline-none" value={form.no_telp} onChange={e=>setForm({...form,no_telp:e.target.value})} /></div>
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Alamat</label>
            <textarea className="w-full px-4 py-2.5 border rounded-xl outline-none" rows={3} value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} /></div>
          <button onClick={save} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4"/>Simpan</button>
        </div>
      </div>
    </div>
  )
}
