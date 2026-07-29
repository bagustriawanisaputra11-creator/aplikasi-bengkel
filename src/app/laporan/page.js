'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart3, TrendingUp, TrendingDown, Download } from 'lucide-react'

export default function Laporan() {
  const [tglAwal, setTglAwal] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] })
  const [tglAkhir, setTglAkhir] = useState(() => new Date().toISOString().split('T')[0])
  const [laporan, setLaporan] = useState({ omset:0, hpp:0, pengeluaran:0, labaKotor:0, labaBersih:0, transaksi:0 })
  const s = createClient()

  async function load() {
    if (!s) return
    const awal = new Date(tglAwal).toISOString()
    const akhir = new Date(tglAkhir+'T23:59:59').toISOString()
    const { data: wo } = await s.from('work_orders').select('total,total_hpp').gte('created_at',awal).lte('created_at',akhir).eq('status','lunas')
    const omset = wo?.reduce((a,b) => a+(b.total||0),0)||0
    const hpp = wo?.reduce((a,b) => a+(b.total_hpp||0),0)||0
    const { data: ex } = await s.from('expenses').select('jumlah').gte('created_at',awal).lte('created_at',akhir)
    const pengeluaran = ex?.reduce((a,b) => a+(b.jumlah||0),0)||0
    setLaporan({ omset, hpp, pengeluaran, labaKotor: omset - hpp, labaBersih: omset - hpp - pengeluaran, transaksi: wo?.length||0 })
  }
  useEffect(() => { load() }, [tglAwal, tglAkhir])

  const cards = [
    { label:'Omset', value:`Rp ${laporan.omset.toLocaleString('id-ID')}`, icon:TrendingUp, color:'bg-green-500' },
    { label:'HPP', value:`Rp ${laporan.hpp.toLocaleString('id-ID')}`, icon:TrendingDown, color:'bg-orange-500' },
    { label:'Pengeluaran', value:`Rp ${laporan.pengeluaran.toLocaleString('id-ID')}`, icon:TrendingDown, color:'bg-red-500' },
    { label:'Laba Kotor', value:`Rp ${laporan.labaKotor.toLocaleString('id-ID')}`, icon:TrendingUp, color:'bg-blue-500' },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"><BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" /></div>
        <div><h1 className="text-sm md:text-xl font-bold text-gray-900">Laporan</h1></div>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border p-3 md:p-4 mb-3 md:mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <div><input type="date" className="w-full px-3 py-2 border rounded-lg outline-none text-xs md:text-sm" value={tglAwal} onChange={e=>setTglAwal(e.target.value)} /></div>
          <div><input type="date" className="w-full px-3 py-2 border rounded-lg outline-none text-xs md:text-sm" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)} /></div>
          <div><button onClick={load} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs md:text-sm font-medium"><Download className="w-3 h-3 inline mr-1"/>Refresh</button></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 mb-3 md:mb-5">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-xl md:rounded-2xl shadow-sm border p-3 md:p-5">
              <div className={`w-7 h-7 md:w-12 md:h-12 ${c.color} rounded-lg md:rounded-xl flex items-center justify-center mb-1 md:mb-4`}><Icon className="w-3 h-3 md:w-6 md:h-6 text-white" /></div>
              <p className="text-[10px] md:text-sm text-gray-500 mb-0.5">{c.label}</p>
              <p className="text-xs md:text-xl font-bold text-gray-900">{c.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
        <p className="text-blue-100 text-[10px] md:text-sm">Laba Bersih</p>
        <p className="text-lg md:text-4xl font-bold text-white mt-1">Rp {laporan.labaBersih.toLocaleString('id-ID')}</p>
        <p className="text-blue-200 text-[10px] md:text-xs mt-1">{new Date(tglAwal).toLocaleDateString('id-ID')} - {new Date(tglAkhir).toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  )
}
