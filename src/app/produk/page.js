export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Plus, Pencil, Trash2, Package, Wrench } from 'lucide-react'
import Modal from '@/components/Modal'
import { showToast } from '@/components/Toast'

export default function Produk() {
  const [tab, setTab] = useState('produk')
  const [data, setData] = useState([]); const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false); const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ nama:'', harga_jual:0, harga_modal:0, stok:0, stok_minimal:5 })
  const s = createClient()

  async function load() {
    let q = s.from(tab==='produk'?'products':'services').select('*').order('created_at',{ascending:false})
    if (search) q = q.ilike('nama',`%${search}%`)
    const {data:d} = await q; setData(d||[])
  }
  useEffect(() => { load() }, [search, tab])

  const openAdd = () => { setEdit(null); setForm({nama:'',harga_jual:0,harga_modal:0,stok:0,stok_minimal:5}); setModal(true) }
  const openEdit = (i) => { setEdit(i.id); setForm(i); setModal(true) }
   const save = async () => {
    if (!form.nama) return showToast('Nama wajib diisi!','error')
    const tbl = tab==='produk'?'products':'services'
    const { data: tn } = await s.from('tenants').select('id').limit(1).single()

    let payload
    if (tab==='jasa') {
      payload = { nama: form.nama, harga: Number(form.harga_jual), kategori: '', tenant_id: tn?.id }
    } else {
      payload = { ...form, tenant_id: tn?.id }
    }

    if (edit) {
      await s.from(tbl).update(payload).eq('id', edit)
      showToast('Diupdate!','success')
    } else {
      await s.from(tbl).insert(payload)
      showToast('Ditambahkan!','success')
    }
    setModal(false); load()
  }

  const hapus = async (id) => { await s.from(tab==='produk'?'products':'services').delete().eq('id',id); showToast('Dihapus!','success'); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Package className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">Produk & Jasa</h1></div>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4"/>Tambah</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('produk')} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab==='produk'?'bg-blue-600 text-white shadow-sm':'bg-white border text-gray-600 hover:bg-gray-50'}`}><Package className="w-4 h-4 inline mr-1"/>Sparepart</button>
        <button onClick={()=>setTab('jasa')} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab==='jasa'?'bg-blue-600 text-white shadow-sm':'bg-white border text-gray-600 hover:bg-gray-50'}`}><Wrench className="w-4 h-4 inline mr-1"/>Jasa</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b"><div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none" placeholder="Cari..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div></div>
        <table className="w-full">
          <thead><tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nama</th>
            {tab==='produk' && <><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Harga Jual</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Stok</th></>}
            {tab==='jasa' && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Harga</th>}
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'} hover:bg-blue-50/50`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{i.nama}</td>
                {tab==='produk' && <><td className="px-4 py-3 text-sm">Rp {(i.harga_jual||0).toLocaleString('id-ID')}</td><td className="px-4 py-3 text-sm"><span className={`${i.stok<=i.stok_minimal?'text-red-600 font-semibold':'text-gray-500'}`}>{i.stok} {i.satuan||'pcs'}</span></td></>}
                {tab==='jasa' && <td className="px-4 py-3 text-sm">Rp {(i.harga||0).toLocaleString('id-ID')}</td>}
                <td className="px-4 py-3 text-center"><div className="flex justify-center gap-2">
                  <button onClick={()=>openEdit(i)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"><Pencil className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>hapus(i.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/></button>
                </div></td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={5} className="p-12 text-center text-gray-300">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit':'Tambah'}>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-gray-500">Nama *</label><input className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-500">{tab==='jasa'?'Harga':'Harga Jual'}</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.harga_jual} onChange={e=>setForm({...form,harga_jual:Number(e.target.value)})} /></div>
            {tab==='produk' && <><div><label className="text-xs font-medium text-gray-500">Harga Modal</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.harga_modal} onChange={e=>setForm({...form,harga_modal:Number(e.target.value)})} /></div>
            <div><label className="text-xs font-medium text-gray-500">Stok</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.stok} onChange={e=>setForm({...form,stok:Number(e.target.value)})} /></div>
            <div><label className="text-xs font-medium text-gray-500">Stok Minimal</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.stok_minimal} onChange={e=>setForm({...form,stok_minimal:Number(e.target.value)})} /></div></>}
          </div>
          <button onClick={save} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 mt-2">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
