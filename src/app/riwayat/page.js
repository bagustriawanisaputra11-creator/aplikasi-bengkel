'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { History, Search, Filter, Printer, Trash2 } from 'lucide-react'
import { showToast } from '@/components/Toast'

export default function Riwayat() {
  const [data, setData] = useState([]); const [search, setSearch] = useState('')
  const [tglAwal, setTglAwal] = useState(''); const [tglAkhir, setTglAkhir] = useState('')
  const s = createClient()

  async function load() {
    let q = s.from('work_orders').select('*, customers(*)').order('created_at',{ascending:false})
    if (search) q = q.or(`no_nota.ilike.%${search}%`)
    if (tglAwal) q = q.gte('created_at',new Date(tglAwal).toISOString())
    if (tglAkhir) q = q.lte('created_at',new Date(tglAkhir+'T23:59:59').toISOString())
    const {data:d} = await q; setData(d||[])
  }
  useEffect(() => { load() }, [search, tglAwal, tglAkhir])

  const hapus = async (id) => { if (!confirm('Yakin?')) return; await s.from('work_orders').delete().eq('id',id); showToast('Dihapus!','success'); load() }

  return (
    <div>
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"><History className="w-4 h-4 md:w-5 md:h-5 text-white" /></div>
        <div><h1 className="text-sm md:text-xl font-bold text-gray-900">Riwayat</h1></div>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border p-3 md:p-4 mb-3 md:mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3">
          <div><input className="w-full px-3 py-2 border rounded-lg outline-none text-xs md:text-sm" placeholder="Cari no nota..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
          <div><input type="date" className="w-full px-3 py-2 border rounded-lg outline-none text-xs md:text-sm" value={tglAwal} onChange={e=>setTglAwal(e.target.value)} /></div>
          <div><input type="date" className="w-full px-3 py-2 border rounded-lg outline-none text-xs md:text-sm" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)} /></div>
          <div><button onClick={load} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs md:text-sm font-medium"><Filter className="w-3 h-3 inline mr-1"/>Filter</button></div>
        </div>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[500px] md:min-w-full">
          <thead><tr>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Nota</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50 hide-mobile">Pelanggan</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Status</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Total</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase bg-gray-50">Aksi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((i,idx)=>(
              <tr key={i.id} className={`${idx%2===0?'bg-white':'bg-gray-50/50'} hover:bg-blue-50/50`}>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold">{i.no_nota}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 hide-mobile">{i.customers?.plat_nomor}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs"><span className={`px-1.5 md:px-2.5 py-0.5 rounded-lg text-[10px] font-medium capitalize ${{menunggu:'bg-amber-100 text-amber-700',dikerjakan:'bg-blue-100 text-blue-700',selesai:'bg-green-100 text-green-700',lunas:'bg-emerald-100 text-emerald-700'}[i.status]}`}>{i.status}</span></td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-bold text-right">Rp {(i.total||0).toLocaleString('id-ID')}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-center"><div className="flex justify-center gap-1">
                  <button className="bg-blue-50 text-blue-600 p-1 md:px-3 md:py-1.5 rounded-lg hover:bg-blue-100"><Printer className="w-3 h-3"/></button>
                  <button onClick={()=>hapus(i.id)} className="bg-red-50 text-red-600 p-1 md:px-3 md:py-1.5 rounded-lg hover:bg-red-100"><Trash2 className="w-3 h-3"/></button>
                </div></td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={5} className="p-6 md:p-12 text-center text-gray-300 text-xs">Belum ada transaksi</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
