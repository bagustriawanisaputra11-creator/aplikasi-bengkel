'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ClipboardList, DollarSign, CalendarDays, Package } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ tc: 0, omset: 0, wo: 0, stok: 0 })

  useEffect(() => {
    (async () => {
      const s = createClient()
      if (!s) return
      const t = new Date(); t.setHours(0,0,0,0)
      const { count: tc } = await s.from('work_orders').select('*',{count:'exact',head:true}).gte('created_at',t.toISOString())
      const { data: od } = await s.from('work_orders').select('total').gte('created_at',t.toISOString()).eq('status','lunas')
      const omset = od?.reduce((a,b) => a+(b.total||0),0)||0
      const { count: wo } = await s.from('work_orders').select('*',{count:'exact',head:true}).in('status',['menunggu','dikerjakan','selesai'])
      setStats({ tc: tc||0, omset, wo: wo||0, stok: 0 })
    })()
  }, [])

  const cards = [
    { label: 'Transaksi Hari Ini', value: stats.tc, icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'Omset Hari Ini', value: `Rp ${(stats.omset||0).toLocaleString('id-ID')}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Work Order Aktif', value: stats.wo, icon: CalendarDays, color: 'bg-amber-500' },
    { label: 'Stok Menipis', value: stats.stok, icon: Package, color: 'bg-rose-500' },
  ]

  return (
    <div className="px-0 md:px-2">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 hidden md:block">Selamat datang kembali! 🚀</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 md:px-4 md:py-2 shadow-sm border text-xs md:text-sm">
          <CalendarDays className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
          <span className="text-gray-600 hidden md:inline">{new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
          <span className="text-gray-600 md:hidden">{new Date().toLocaleDateString('id-ID', { day:'numeric', month:'short' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-3 md:p-5">
              <div className="w-8 h-8 md:w-12 md:h-12 {c.color} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-black/5 mb-2 md:mb-4"
                style={{background: c.color.includes('bg-') ? '' : c.color}}>
                <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-[10px] md:text-sm text-gray-500 mb-0.5 md:mb-1">{c.label}</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
