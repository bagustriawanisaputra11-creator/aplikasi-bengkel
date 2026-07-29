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
    const awal = new Date(tglAwal).toISOString()
    const akhir = new Date(tglAkhir+'T23:59:59').toISOString()

    const { data: wo } = await s.from('work_orders').select('total,total_hpp').gte('created_at',awal).lte('created_at',akhir).eq('status','lunas')
    const omset = wo?.reduce((a,b) => a+(b.total||0),0)||0
    const hpp = wo?.reduce((a,b) => a+(b.total_hpp||0),0)||0

    const { data: ex } = await s.from('expenses').select('jumlah').gte('created_at',awal).lte('created_at',akhir)
    const pengeluaran = ex?.reduce((a,b) => a+(b.jumlah||0),0)||0

    setLaporan({
      omset, hpp, pengeluaran,
      labaKotor: omset - hpp,
      labaBersih: omset - hpp - pengeluaran,
      transaksi: wo?.length||0,
    })
  }
  useEffect(() => { load() }, [tglAwal, tglAkhir])

  const cards = [
    { label:'Omset', value:`Rp ${laporan.omset.toLocaleString('id-ID')}`, icon:TrendingUp, color:'bg-green-500', detail:`${laporan.transaksi} transaksi` },
    { label:'HPP (Modal)', value:`Rp ${laporan.hpp.toLocaleString('id-ID')}`, icon:TrendingDown, color:'bg-orange-500', detail:'Total modal sparepart' },
    { label:'Pengeluaran', value:`Rp ${laporan.pengeluaran.toLocaleString('id-ID')}`, icon:TrendingDown, color:'bg-red-500', detail:'Operasional' },
    { label:'Laba Kotor', value:`Rp ${laporan.labaKotor.toLocaleString('id-ID')}`, icon:TrendingUp, color:'bg-blue-500', detail:'Omset - HPP' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">Laporan</h1><p className="text-xs text-gray-500">Omset & Laba Bersih</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Dari Tanggal</label>
            <input type="date" className="w-full px-4 py-2.5 border rounded-xl outline-none" value={tglAwal} onChange={e=>setTglAwal(e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">Sampai Tanggal</label>
            <input type="date" className="w-full px-4 py-2.5 border rounded-xl outline-none" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)} /></div>
          <div><button onClick={load} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"><Download className="w-4 h-4"/>Refresh</button></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center shadow-lg shadow-black/5`}><Icon className="w-6 h-6 text-white" /></div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.detail}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg">
        <p className="text-blue-100 text-sm font-medium">Laba Bersih</p>
        <p className="text-4xl font-bold text-white mt-1">Rp {laporan.labaBersih.toLocaleString('id-ID')}</p>
        <p className="text-blue-200 text-xs mt-2">{new Date(tglAwal).toLocaleDateString('id-ID')} - {new Date(tglAkhir).toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  )
}
