'use client'

export const dynamic = 'force-dynamic'
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
    const tbl = tab==='produk'?'products':'services'
    let q = s.from(tbl).select('*').order('created_at',{ascending:false})
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
    let payload = tbl==='services' ? { nama: form.nama, harga: Number(form.harga_jual), kategori: '', tenant_id: tn?.id } : { ...form, tenant_id: tn?.id }
    if (edit) { await s.from(tbl).update(payload).eq('id',edit); showToast('Diupdate!','success') }
    else { await s.from(tbl).insert(payload); showToast('Ditambahkan!','success') }
    setModal(false); load()
  }
  const hapus = async (id) => { await s.from(tab==='produk'?'products':'services').delete().eq('id',id); showToast('Dihapus!','success'); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"><Package className="w-4 h-4 md:w-5 md:h-5 text-white" /></div>
          <div><h1 className="text-sm md:text-xl font-bold text-gray-900">Produk & Jasa</h1></div>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium flex items-center gap-1"><Plus className="w-3 h-3 md:w-4 md:h-4"/>Tambah</button>
      </div>

      <div className="flex gap-1 md:gap-2 mb-3 md:mb-4 overflow-x-auto">
        <button onClick={()=>setTab('produk')} className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium whitespace-nowrap ${tab==='produk'?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}><Package className="w-3 h-3 md:w-4 md:h-4 inline mr-1"/>Sparepart</button>
        <button onClick={()=>setTab('jasa')} className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium whitespace-nowrap ${tab==='jasa'?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}><Wrench className="w-3 h-3 md:w-4 md:h-4 inline mr-1"/>Jasa</button>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border overflow-x-auto">
        <div className="p-3 md:p-4 border-b"><div className="relative max-w-xs md:max-w-md">
          <Search className="absolute left-3 top-2.5 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border rounded-lg md:rounded-xl outline-none text-xs md:text-sm" placeholder="Cari..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div></div>
        <table className="w-full min-w-[500px] md:min-w-full">
          <thead><tr>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nama</th>
            {tab==='produk' && <><th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50 hide-mobile">Harga Jual</th><th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Stok</th></>}
            {tab==='jasa' && <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Harga</th>}
            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'} hover:bg-blue-50/50`}>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">{i.nama}</td>
                {tab==='produk' && <><td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm hide-mobile">Rp {(i.harga_jual||0).toLocaleString('id-ID')}</td><td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center"><span className={`${i.stok<=i.stok_minimal?'text-red-600 font-semibold':'text-gray-500'}`}>{i.stok}</span></td></>}
                {tab==='jasa' && <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">Rp {(i.harga||0).toLocaleString('id-ID')}</td>}
                <td className="px-2 md:px-4 py-2 md:py-3 text-center"><div className="flex justify-center gap-1">
                  <button onClick={()=>openEdit(i)} className="bg-blue-50 text-blue-600 p-1 md:px-3 md:py-1.5 rounded-lg hover:bg-blue-100"><Pencil className="w-3 h-3"/></button>
                  <button onClick={()=>hapus(i.id)} className="bg-red-50 text-red-600 p-1 md:px-3 md:py-1.5 rounded-lg hover:bg-red-100"><Trash2 className="w-3 h-3"/></button>
                </div></td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={5} className="p-6 md:p-12 text-center text-gray-300 text-xs">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit':'Tambah'}>
        <div className="space-y-2 md:space-y-3">
          <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Nama *</label><input className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">{tab==='jasa'?'Harga':'Harga Jual'}</label><input type="number" className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.harga_jual} onChange={e=>setForm({...form,harga_jual:Number(e.target.value)})} /></div>
            {tab==='produk' && <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Modal</label><input type="number" className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.harga_modal} onChange={e=>setForm({...form,harga_modal:Number(e.target.value)})} /></div>}
          </div>
          {tab==='produk' && <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Stok</label><input type="number" className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.stok} onChange={e=>setForm({...form,stok:Number(e.target.value)})} /></div>
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Stok Min</label><input type="number" className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.stok_minimal} onChange={e=>setForm({...form,stok_minimal:Number(e.target.value)})} /></div>
          </div>}
          <button onClick={save} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
