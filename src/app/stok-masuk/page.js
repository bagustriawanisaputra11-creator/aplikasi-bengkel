'use client'

export const dynamic = 'force-dynamic'
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
    const {data:pr} = await s.from('products').select('stok').eq('id',form.product_id).single()
    await s.from('products').update({stok: (pr?.stok||0)+Number(form.qty)}).eq('id',form.product_id)
    showToast('Stok ditambahkan!','success'); setModal(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"><PackagePlus className="w-4 h-4 md:w-5 md:h-5 text-white" /></div>
          <div><h1 className="text-sm md:text-xl font-bold text-gray-900">Stok Masuk</h1></div>
        </div>
        <button onClick={()=>setModal(true)} className="bg-blue-600 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium flex items-center gap-1"><Plus className="w-3 h-3 md:w-4 md:h-4"/>Tambah</button>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border overflow-x-auto">
        <div className="p-3 md:p-4 border-b"><div className="relative max-w-xs md:max-w-md">
          <Search className="absolute left-3 top-2.5 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border rounded-lg md:rounded-xl outline-none text-xs md:text-sm" placeholder="Cari..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div></div>
        <table className="w-full min-w-[500px] md:min-w-full">
          <thead><tr>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Produk</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Qty</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50 hide-mobile">Harga Modal</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50 hide-mobile">Tanggal</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'}`}>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium">{i.products?.nama}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-green-600 font-semibold">+{i.qty}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm hide-mobile">Rp {(i.harga_modal||0).toLocaleString('id-ID')}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 hide-mobile">{new Date(i.created_at).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={4} className="p-6 md:p-12 text-center text-gray-300 text-xs">Belum ada stok masuk</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Tambah Stok Masuk">
        <div className="space-y-2 md:space-y-3">
          <select className="w-full px-3 py-2 border rounded-lg outline-none text-sm bg-white" value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})}>
            <option value="">Pilih produk...</option>
            {products.map(p=><option key={p.id} value={p.id}>{p.nama} (stok: {p.stok})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Jumlah</label><input type="number" className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.qty} onChange={e=>setForm({...form,qty:Number(e.target.value)})} /></div>
            <div><label className="text-[10px] md:text-xs font-medium text-gray-500">Harga Modal</label><input type="number" className="w-full px-3 py-2 border rounded-lg outline-none text-sm mt-1" value={form.harga_modal} onChange={e=>setForm({...form,harga_modal:Number(e.target.value)})} /></div>
          </div>
          <button onClick={save} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
