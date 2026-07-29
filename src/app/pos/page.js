'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Trash2, User, Wrench, Package, ShoppingCart } from 'lucide-react'
import { showToast } from '@/components/Toast'

export default function POS() {
  const s = createClient()
  const [c, setC] = useState(null); const [cs, setCs] = useState(''); const [cl, setCl] = useState([])
  const [ss, setSs] = useState(''); const [sl, setSl] = useState([]); const [sa, setSa] = useState([])
  const [ps, setPs] = useState(''); const [pl, setPl] = useState([]); const [pa, setPa] = useState([])
  const [dk, setDk] = useState(0)

  useEffect(() => {
    if (!cs) { setCl([]); return }
    const t = setTimeout(async () => {
      const { data } = await s.from('customers').select('*').or(`plat_nomor.ilike.%${cs}%,nama.ilike.%${cs}%,no_hp.ilike.%${cs}%`).limit(10)
      setCl(data||[])
    }, 200)
    return () => clearTimeout(t)
  }, [cs])

  useEffect(() => {
    if (!ss) { setSl([]); return }
    const t = setTimeout(async () => {
      const { data } = await s.from('services').select('*').ilike('nama',`%${ss}%`).limit(10)
      setSl(data||[])
    }, 200)
    return () => clearTimeout(t)
  }, [ss])

  useEffect(() => {
    if (!ps) { setPl([]); return }
    const t = setTimeout(async () => {
      const { data } = await s.from('products').select('*').ilike('nama',`%${ps}%`).limit(10)
      setPl(data||[])
    }, 200)
    return () => clearTimeout(t)
  }, [ps])

  const tj = sa.reduce((s,x) => s + x.harga * x.q, 0)
  const tp = pa.reduce((s,x) => s + x.hj * x.q, 0)
  const th = pa.reduce((s,x) => s + (x.hm||0) * x.q, 0)
  const total = tj + tp - dk

  const simpan = async () => {
    if (!c) return showToast('Pilih pelanggan dulu!', 'error')
    if (!sa.length && !pa.length) return showToast('Tambah jasa atau sparepart!', 'error')

    const { data: tn } = await s.from('tenants').select('id').limit(1).single()
    const nn = `WO-${Date.now().toString().slice(-8)}`
    const { data: wo, error } = await s.from('work_orders').insert({
      tenant_id: tn?.id, customer_id: c.id, no_nota: nn,
      status: 'menunggu',
      subtotal_jasa: tj, subtotal_part: tp, total_hpp: th, total,
      diskon: dk, catatan: '',
    }).select().single()

    if (error) return showToast('Gagal: '+error.message, 'error')

    for (const i of sa) {
      await s.from('work_order_services').insert({
        work_order_id: wo.id, service_id: i.id, nama_jasa: i.nama, harga: i.harga, qty: i.q
      })
    }
    for (const i of pa) {
      await s.from('work_order_parts').insert({
        work_order_id: wo.id, product_id: i.id, nama_part: i.nama,
        harga_jual: i.hj, harga_modal: i.hm||0, qty: i.q
      })
      try { await s.rpc('kurangi_stok', {pid:i.id, q:i.q}) } catch(e) {}
    }

    showToast(`✅ WO ${nn} dibuat! Status: menunggu`, 'success')
    setC(null); setCs(''); setSa([]); setPa([]); setDk(0)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><ShoppingCart className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">POS Kasir</h1><p className="text-xs text-gray-500">Buat work order baru</p></div>
      </div>

      {/* Pelanggan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-blue-600" /><span className="font-medium text-sm text-gray-700">Pelanggan</span></div>
        {c ? (
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
              <div><span className="font-bold text-gray-900">{c.plat_nomor}</span><span className="mx-2 text-gray-300">•</span><span className="text-gray-700">{c.nama}</span>{c.no_hp&&<span className="text-gray-400 ml-2 text-sm">({c.no_hp})</span>}</div>
            </div>
            <button onClick={()=>{setC(null);setCs('')}} className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Ganti</button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Cari plat / nama / no HP..." value={cs} onChange={e=>setCs(e.target.value)} />
            {cl.length>0 && <div className="absolute z-10 w-full bg-white border rounded-xl mt-1.5 shadow-xl max-h-48 overflow-y-auto">
              {cl.map(x=>(
                <div key={x.id} className="flex items-center gap-3 p-3.5 hover:bg-blue-50 cursor-pointer border-b last:border-0" onClick={()=>{setC(x);setCl([]);setCs('')}}>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                  <div><span className="font-medium text-sm">{x.plat_nomor}</span><span className="text-gray-400 mx-1.5">•</span><span className="text-sm text-gray-600">{x.nama}</span></div>
                </div>
              ))}
            </div>}
          </div>
        )}
      </div>

      {/* Jasa & Sparepart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Wrench className="w-4 h-4 text-blue-600" /><span className="font-medium text-sm text-gray-700">Jasa Servis</span></div>
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Cari jasa..." value={ss} onChange={e=>setSs(e.target.value)} />
            {sl.length>0 && <div className="absolute z-10 w-full bg-white border rounded-xl mt-1.5 shadow-xl max-h-40 overflow-y-auto">
              {sl.map(x=>(
                <div key={x.id} className="flex items-center justify-between p-3.5 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                  onClick={()=>{if(!sa.find(y=>y.id===x.id)){setSa([...sa,{...x,q:1}]);setSs('');setSl([])}}}>
                  <span className="text-sm">{x.nama}</span><span className="font-semibold text-blue-600 text-sm">Rp {x.harga.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sa.map(x=>(
              <div key={x.id} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="flex-1 text-sm font-medium text-gray-700 truncate">{x.nama}</span>
                <input className="w-16 p-1.5 border rounded-lg text-sm text-center" value={x.q} onChange={e=>{const v=[...sa];v.find(y=>y.id===x.id).q=Math.max(1,Number(e.target.value));setSa(v)}} />
                <input className="w-24 p-1.5 border rounded-lg text-sm text-right font-medium" value={x.harga} onChange={e=>{const v=[...sa];v.find(y=>y.id===x.id).harga=Number(e.target.value);setSa(v)}} />
                <button onClick={()=>setSa(sa.filter(y=>y.id!==x.id))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400"/></button>
              </div>
            ))}
            {sa.length===0 && <p className="text-sm text-gray-300 text-center py-4">Belum ada jasa dipilih</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-blue-600" /><span className="font-medium text-sm text-gray-700">Sparepart</span></div>
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Cari sparepart..." value={ps} onChange={e=>setPs(e.target.value)} />
            {pl.length>0 && <div className="absolute z-10 w-full bg-white border rounded-xl mt-1.5 shadow-xl max-h-40 overflow-y-auto">
              {pl.map(x=>(
                <div key={x.id} className="flex items-center justify-between p-3.5 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                  onClick={()=>{if(!pa.find(y=>y.id===x.id)){setPa([...pa,{id:x.id,nama:x.nama,hj:x.harga_jual,hm:x.harga_modal,q:1}]);setPs('');setPl([])}}}>
                  <span className="text-sm">{x.nama} <span className="text-gray-400 text-xs">(stok:{x.stok})</span></span>
                  <span className="font-semibold text-blue-600 text-sm">Rp {x.harga_jual.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pa.map(x=>(
              <div key={x.id} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="flex-1 text-sm font-medium text-gray-700 truncate">{x.nama}</span>
                <input className="w-16 p-1.5 border rounded-lg text-sm text-center" value={x.q} onChange={e=>{const v=[...pa];v.find(y=>y.id===x.id).q=Math.max(1,Number(e.target.value));setPa(v)}} />
                <input className="w-24 p-1.5 border rounded-lg text-sm text-right font-medium" value={x.hj} onChange={e=>{const v=[...pa];v.find(y=>y.id===x.id).hj=Number(e.target.value);setPa(v)}} />
                <button onClick={()=>setPa(pa.filter(y=>y.id!==x.id))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400"/></button>
              </div>
            ))}
            {pa.length===0 && <p className="text-sm text-gray-300 text-center py-4">Belum ada sparepart dipilih</p>}
          </div>
        </div>
      </div>

      {/* Ringkasan + Buat WO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div><span className="text-sm text-gray-500">Jasa</span><p className="font-bold text-gray-900">Rp {tj.toLocaleString('id-ID')}</p></div>
            <div><span className="text-sm text-gray-500">Part</span><p className="font-bold text-gray-900">Rp {tp.toLocaleString('id-ID')}</p></div>
            <div><span className="text-sm text-gray-500">Diskon</span><p className="font-bold text-red-500">- Rp {dk.toLocaleString('id-ID')}</p></div>
          </div>
          <div className="text-right"><span className="text-xs text-gray-400">Total</span><p className="text-3xl font-bold text-gray-900">Rp {(total).toLocaleString('id-ID')}</p></div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Diskon</label>
          <input type="number" className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl outline-none" value={dk} onChange={e=>setDk(Number(e.target.value))} />
        </div>

        <button onClick={simpan} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25">
          🔧 Buat Work Order
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">Status awal: Menunggu → Bayar nanti di menu Work Order</p>
      </div>
    </div>
  )
}
