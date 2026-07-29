'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { LayoutDashboard, ShoppingCart, ClipboardList, Users, Package, PackagePlus, DollarSign, History, BarChart3, Settings, Wrench, Menu, X, LogOut } from 'lucide-react'

const menu = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'POS Kasir', icon: ShoppingCart, href: '/pos' },
  { label: 'Work Order', icon: ClipboardList, href: '/work-order' },
  { label: 'Pelanggan', icon: Users, href: '/pelanggan' },
  { label: 'Produk & Jasa', icon: Package, href: '/produk' },
  { label: 'Stok Masuk', icon: PackagePlus, href: '/stok-masuk' },
  { label: 'Pengeluaran', icon: DollarSign, href: '/pengeluaran' },
  { label: 'Riwayat', icon: History, href: '/riwayat' },
  { label: 'Laporan', icon: BarChart3, href: '/laporan' },
  { label: 'Pengaturan', icon: Settings, href: '/pengaturan' },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [trialHari, setTrialHari] = useState(7)

  useEffect(() => {
    (async () => {
      const s = createClient()
      const { data: { session } } = await s.auth.getSession()
      if (session) {
        const { data: tenant } = await s.from('tenants').select('trial_ends_at').eq('email', session.user.email).single()
        if (tenant?.trial_ends_at) {
          const sisa = Math.ceil((new Date(tenant.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
          setTrialHari(Math.max(0, sisa))
        }
      }
    })()
  }, [])

  const logout = async () => {
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  const isLoginPage = path === '/login' || path === '/register'

  if (isLoginPage) return null

  return (
    <>
      <button onClick={()=>setOpen(true)} className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center">
        <Menu className="w-5 h-5" />
      </button>
      {open && <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={()=>setOpen(false)} />}
      <aside className={`fixed md:static z-40 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-xl transition-all duration-300 ${
        open ? 'left-0' : '-left-64 md:left-0'
      } w-64`}>
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">Aplikasi Bengkel</h1>
              <p className="text-[10px] text-blue-300/80 font-medium">Manajemen Profesional</p>
            </div>
          </div>
          <button onClick={()=>setOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {menu.map((item) => {
            const Icon = item.icon
            const active = path === item.href
            return (
              <Link key={item.href} href={item.href} onClick={()=>setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  active ? 'bg-blue-600/20 text-white font-medium shadow-sm border border-blue-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}>
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-blue-400' : ''}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${trialHari > 3 ? 'bg-green-400' : trialHari > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-400">
              {trialHari > 0 ? `Trial: ${trialHari} hari` : 'Trial habis'}
            </span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 w-full rounded-xl p-2.5 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
