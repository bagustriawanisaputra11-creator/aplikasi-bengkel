export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { PackagePlus, Search, Plus } from 'lucide-react'
import Modal from '@/components/Modal'
import { showToast } from '@/components/Toast'

export default function StokMasuk() {
  const [data, setData] = useState([]); const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false); const [products, setProducts] = useState([])
  const [form, setForm] = useState({ product_id:'', qty:1, harga_modal:0 })
  const s = createClient()

  async function load() {
    let q = s.from('stock_transactions').select('*, products(*)').order('created_at',{ascending:false})
    if (search) q = q.ilike('products.nama',`%${search}%`)
    const {data:d} = await q; setData(d||[])
    const {data:p} = await s.from('products').select('*').order('nama')
    setProducts(p||[])
  }
  useEffect(() => { load() }, [search])

  const save = async () => {
    if (!form.product_id || !form.qty) return showToast('Lengkapi data!','error')
    const { data: tn } = await s.from('tenants').select('id').limit(1).single()
    await s.from('stock_transactions').insert({...form, tenant_id: tn?.id})
    await s.from('products').update({stok: s.rpc('tambah_stok',{pid:form.product_id,q:form.qty})}).eq('id',form.product_id)
    // simpler: get current stok lalu update
    const {data:pr} = await s.from('products').select('stok').eq('id',form.product_id).single()
    await s.from('products').update({stok: (pr?.stok||0)+Number(form.qty)}).eq('id',form.product_id)
    showToast('Stok berhasil ditambahkan!','success')
    setModal(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><PackagePlus className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">Stok Masuk</h1><p className="text-xs text-gray-500">Catat pembelian sparepart</p></div>
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
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Produk</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Qty</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Harga Modal</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Tanggal</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{i.products?.nama}</td>
                <td className="px-4 py-3 text-sm">+{i.qty}</td>
                <td className="px-4 py-3 text-sm">Rp {(i.harga_modal||0).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(i.created_at).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={4} className="p-12 text-center text-gray-300">Belum ada stok masuk</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Tambah Stok Masuk">
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-gray-500">Produk</label>
            <select className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none bg-white" value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})}>
              <option value="">Pilih produk...</option>
              {products.map(p=><option key={p.id} value={p.id}>{p.nama} (stok: {p.stok})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-500">Jumlah</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.qty} onChange={e=>setForm({...form,qty:Number(e.target.value)})} /></div>
            <div><label className="text-xs font-medium text-gray-500">Harga Modal</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl mt-1 outline-none" value={form.harga_modal} onChange={e=>setForm({...form,harga_modal:Number(e.target.value)})} /></div>
          </div>
          <button onClick={save} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 mt-2">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
