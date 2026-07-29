'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { History, Search, Filter, Printer, Trash2 } from 'lucide-react'
import { showToast } from '@/components/Toast'

export default function Riwayat() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [tglAwal, setTglAwal] = useState('')
  const [tglAkhir, setTglAkhir] = useState('')
  const s = createClient()

  async function load() {
    let q = s.from('work_orders').select('*, customers(*)').order('created_at',{ascending:false})
    if (search) q = q.or(`no_nota.ilike.%${search}%`)
    if (tglAwal) q = q.gte('created_at',new Date(tglAwal).toISOString())
    if (tglAkhir) q = q.lte('created_at',new Date(tglAkhir+'T23:59:59').toISOString())
    const {data:d} = await q; setData(d||[])
  }
  useEffect(() => { load() }, [search, tglAwal, tglAkhir])

  const hapus = async (id) => {
    if (!confirm('Yakin hapus transaksi ini?')) return
    await s.from('work_orders').delete().eq('id',id)
    showToast('Transaksi dihapus!','success'); load()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><History className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Riwayat Transaksi</h1></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Cari</label>
            <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none" placeholder="No nota..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Dari Tanggal</label>
            <input type="date" className="w-full px-4 py-2.5 border rounded-xl outline-none" value={tglAwal} onChange={e=>setTglAwal(e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Sampai Tanggal</label>
            <input type="date" className="w-full px-4 py-2.5 border rounded-xl outline-none" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)} /></div>
          <div><button onClick={load} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"><Filter className="w-4 h-4"/>Filter</button></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead><tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nota</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Pelanggan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Status</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase bg-gray-50">Total</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">Tanggal</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'} hover:bg-blue-50/50`}>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{i.no_nota}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{i.customers?.plat_nomor} - {i.customers?.nama}</td>
                <td className="px-4 py-3 text-sm"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${{menunggu:'bg-amber-100 text-amber-700',dikerjakan:'bg-blue-100 text-blue-700',selesai:'bg-green-100 text-green-700',lunas:'bg-emerald-100 text-emerald-700'}[i.status]}`}>{i.status}</span></td>
                <td className="px-4 py-3 text-sm font-bold text-right">Rp {(i.total||0).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(i.created_at).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-center"><div className="flex justify-center gap-2">
                  <button className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"><Printer className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>hapus(i.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/></button>
                </div></td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={6} className="p-12 text-center text-gray-300">Belum ada transaksi</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
