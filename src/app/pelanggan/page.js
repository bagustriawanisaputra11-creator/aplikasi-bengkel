export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react'
import Modal from '@/components/Modal'
import { showToast } from '@/components/Toast'

export default function Pelanggan() {
  const [data, setData] = useState([]); const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false); const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ plat_nomor:'', nama:'', no_hp:'', alamat:'', merek:'', tipe:'' })
  const s = createClient()

  async function load() {
    let q = s.from('customers').select('*').order('created_at',{ascending:false})
    if (search) q = q.or(`plat_nomor.ilike.%${search}%,nama.ilike.%${search}%,no_hp.ilike.%${search}%`)
    const {data:d} = await q; setData(d||[])
  }

  useEffect(() => { load() }, [search])

  const openAdd = () => { setEdit(null); setForm({plat_nomor:'',nama:'',no_hp:'',alamat:'',merek:'',tipe:''}); setModal(true) }
  const openEdit = (i) => { setEdit(i.id); setForm(i); setModal(true) }

  const save = async () => {
    if (!form.plat_nomor || !form.nama) return showToast('Plat & nama wajib diisi!', 'error')
    if (edit) {
      await s.from('customers').update(form).eq('id', edit)
      showToast('Pelanggan diupdate!', 'success')
    } else {
      const { data: tn } = await s.from('tenants').select('id').limit(1).single()
      await s.from('customers').insert({...form, tenant_id: tn?.id})
      showToast('Pelanggan ditambahkan!', 'success')
    }
    setModal(false); load()
  }

  const hapus = async (id) => {
    if (!confirm('Yakin hapus pelanggan ini?')) return
    await s.from('customers').delete().eq('id', id)
    showToast('Pelanggan dihapus!', 'success')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Users className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">Pelanggan</h1><p className="text-xs text-gray-500">Kelola data pelanggan bengkel</p></div>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Cari plat, nama, atau no HP..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        <table className="w-full">
          <thead><tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Plat</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nama</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">No HP</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Kendaraan</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'} hover:bg-blue-50/50`}>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{i.plat_nomor}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{i.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{i.no_hp||'-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{[i.merek,i.tipe].filter(Boolean).join(' ')||'-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={()=>openEdit(i)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1"><Pencil className="w-3.5 h-3.5"/>Edit</button>
                    <button onClick={()=>hapus(i.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5"/>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={5} className="p-12 text-center text-gray-300">Belum ada data pelanggan</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit Pelanggan':'Tambah Pelanggan'}>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-gray-500">Plat Nomor *</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.plat_nomor} onChange={e=>setForm({...form,plat_nomor:e.target.value})} /></div>
          <div><label className="text-xs font-medium text-gray-500">Nama *</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} /></div>
          <div><label className="text-xs font-medium text-gray-500">No HP</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.no_hp} onChange={e=>setForm({...form,no_hp:e.target.value})} /></div>
          <div><label className="text-xs font-medium text-gray-500">Alamat</label><textarea className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-500">Merek</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" placeholder="Honda" value={form.merek} onChange={e=>setForm({...form,merek:e.target.value})} /></div>
            <div><label className="text-xs font-medium text-gray-500">Tipe</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" placeholder="Vario 150" value={form.tipe} onChange={e=>setForm({...form,tipe:e.target.value})} /></div>
          </div>
          <button onClick={save} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 mt-2">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
