'use client'

export const dynamic = 'force-dynamic'
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
    const { data: tn } = await s.from('tenants').select('id').limit(1).single()
    if (edit) { await s.from('customers').update(form).eq('id', edit); showToast('Diupdate!','success') }
    else { await s.from('customers').insert({...form, tenant_id: tn?.id}); showToast('Ditambahkan!','success') }
    setModal(false); load()
  }
  const hapus = async (id) => { if (!confirm('Yakin?')) return; await s.from('customers').delete().eq('id',id); showToast('Dihapus!','success'); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"><Users className="w-4 h-4 md:w-5 md:h-5 text-white" /></div>
          <div><h1 className="text-sm md:text-xl font-bold text-gray-900">Pelanggan</h1><p className="text-[10px] md:text-xs text-gray-500">Kelola data pelanggan</p></div>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium flex items-center gap-1"><Plus className="w-3 h-3 md:w-4 md:h-4" /> Tambah</button>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border overflow-x-auto">
        <div className="p-3 md:p-4 border-b">
          <div className="relative max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-2.5 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 border rounded-lg md:rounded-xl outline-none text-xs md:text-sm" placeholder="Cari plat, nama..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        <table className="w-full min-w-[500px] md:min-w-full">
          <thead><tr>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Plat</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nama</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50 hide-mobile">No HP</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50 hide-mobile">Kendaraan</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'} hover:bg-blue-50/50`}>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-900">{i.plat_nomor}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700">{i.nama}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 hide-mobile">{i.no_hp||'-'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 hide-mobile">{[i.merek,i.tipe].filter(Boolean).join(' ')||'-'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                  <div className="flex justify-center gap-1 md:gap-2">
                    <button onClick={()=>openEdit(i)} className="bg-blue-50 text-blue-600 px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs hover:bg-blue-100"><Pencil className="w-3 h-3 md:w-3.5 md:h-3.5 inline" /><span className="hidden md:inline ml-1">Edit</span></button>
                    <button onClick={()=>hapus(i.id)} className="bg-red-50 text-red-600 px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs hover:bg-red-100"><Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5 inline" /><span className="hidden md:inline ml-1">Hapus</span></button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={5} className="p-6 md:p-12 text-center text-gray-300 text-xs">Belum ada pelanggan</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit Pelanggan':'Tambah Pelanggan'}>
        <div className="space-y-2 md:space-y-3">
          <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Plat *</label><input className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.plat_nomor} onChange={e=>setForm({...form,plat_nomor:e.target.value})} /></div>
          <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Nama *</label><input className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">No HP</label><input className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.no_hp} onChange={e=>setForm({...form,no_hp:e.target.value})} /></div>
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Merek</label><input className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.merek} onChange={e=>setForm({...form,merek:e.target.value})} /></div>
          </div>
          <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Tipe</label><input className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.tipe} onChange={e=>setForm({...form,tipe:e.target.value})} /></div>
          <button onClick={save} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
