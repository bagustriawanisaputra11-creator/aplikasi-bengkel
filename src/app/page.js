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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang kembali! 🚀</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center shadow-lg shadow-black/5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
