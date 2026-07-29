export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { DollarSign, Search, Plus, Trash2 } from 'lucide-react'
import Modal from '@/components/Modal'
import { showToast } from '@/components/Toast'

export default function Pengeluaran() {
  const [data, setData] = useState([]); const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nama:'', jumlah:0, kategori:'', catatan:'' })
  const s = createClient()

  async function load() {
    let q = s.from('expenses').select('*').order('created_at',{ascending:false})
    if (search) q = q.ilike('nama',`%${search}%`)
    const {data:d} = await q; setData(d||[])
  }
  useEffect(() => { load() }, [search])

  const save = async () => {
    if (!form.nama || !form.jumlah) return showToast('Lengkapi data!','error')
    const { data: tn } = await s.from('tenants').select('id').limit(1).single()
    await s.from('expenses').insert({...form, tenant_id: tn?.id})
    showToast('Pengeluaran dicatat!','success'); setModal(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><DollarSign className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">Pengeluaran</h1><p className="text-xs text-gray-500">Catat pengeluaran operasional</p></div>
        </div>
        <button onClick={()=>setModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4"/>Tambah</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b"><div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none" placeholder="Cari..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div></div>
        <table className="w-full">
          <thead><tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nama</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Kategori</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Jumlah</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Tanggal</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{i.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{i.kategori||'-'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-red-600">-Rp {(i.jumlah||0).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(i.created_at).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-center"><button onClick={async()=>{await s.from('expenses').delete().eq('id',i.id);showToast('Dihapus!','success');load()}} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/></button></td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={5} className="p-12 text-center text-gray-300">Belum ada pengeluaran</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title="Tambah Pengeluaran">
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-gray-500">Nama *</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-500">Jumlah *</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.jumlah} onChange={e=>setForm({...form,jumlah:Number(e.target.value)})} /></div>
            <div><label className="text-xs font-medium text-gray-500">Kategori</label>
              <select className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none bg-white" value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})}>
                <option value="">Pilih...</option>
                <option value="Listrik">Listrik</option><option value="Air">Air</option><option value="Sewa">Sewa</option><option value="Gaji">Gaji</option><option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <div><label className="text-xs font-medium text-gray-500">Catatan</label><textarea className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.catatan} onChange={e=>setForm({...form,catatan:e.target.value})} /></div>
          <button onClick={save} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 mt-2">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
