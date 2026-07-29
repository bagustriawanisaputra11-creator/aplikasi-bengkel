export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ClipboardList, Search, ChevronRight, Pencil, Trash2, Wrench, Package } from 'lucide-react'
import Modal from '@/components/Modal'
import { showToast } from '@/components/Toast'
import StrukPrint from '@/components/StrukPrint'

export default function WorkOrder() {
  const s = createClient()
  const [data, setData] = useState([]); const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('semua')
  const [modalBayar, setModalBayar] = useState(false)
  const [woBayar, setWoBayar] = useState(null)
  const [metode, setMetode] = useState('tunai')
  const [bayar, setBayar] = useState(0)
  const [modalEdit, setModalEdit] = useState(false)
  const [woEdit, setWoEdit] = useState(null)
  const [editServices, setEditServices] = useState([])
  const [editParts, setEditParts] = useState([])
  const [es, setEs] = useState(''); const [el, setEl] = useState([])
  const [ep, setEp] = useState(''); const [epl, setEpl] = useState([])
  const [cetakData, setCetakData] = useState(null)

  async function load() {
    let q = s.from('work_orders').select('*, customers(*)').order('created_at',{ascending:false})
    if (filter!=='semua') q = q.eq('status',filter)
    if (search) q = q.or(`no_nota.ilike.%${search}%`)
    const {data:d} = await q; setData(d||[])
  }
  useEffect(() => { load() }, [search, filter])

  useEffect(() => {
    if (!es) { setEl([]); return }
    const t = setTimeout(async () => {
      const { data } = await s.from('services').select('*').ilike('nama', `%${es}%`).limit(10)
      setEl(data || [])
    }, 200)
    return () => clearTimeout(t)
  }, [es])

  useEffect(() => {
    if (!ep) { setEpl([]); return }
    const t = setTimeout(async () => {
      const { data } = await s.from('products').select('*').ilike('nama', `%${ep}%`).limit(10)
      setEpl(data || [])
    }, 200)
    return () => clearTimeout(t)
  }, [ep])

  useEffect(() => {
    if (cetakData) {
      setTimeout(() => {
        window.print()
        setTimeout(() => setCetakData(null), 1000)
      }, 500)
    }
  }, [cetakData])

  const updateStatus = async (id, status) => {
    await s.from('work_orders').update({status}).eq('id',id)
    showToast(`Status → ${status}`,'success'); load()
  }

  const openEdit = async (wo) => {
    setWoEdit(wo)
    const {data: sv} = await s.from('work_order_services').select('*').eq('work_order_id', wo.id)
    const {data: pt} = await s.from('work_order_parts').select('*').eq('work_order_id', wo.id)
    setEditServices(sv?.map(x => ({id: x.service_id, nama: x.nama_jasa, harga: x.harga, q: x.qty, _uid: x.id})) || [])
    setEditParts(pt?.map(x => ({id: x.product_id, nama: x.nama_part, hj: x.harga_jual, hm: x.harga_modal, q: x.qty, _uid: x.id})) || [])
    setModalEdit(true)
  }

  const addEditService = (svc) => {
    setEditServices(prev => {
      if (prev.find(x => x.id === svc.id)) return prev
      return [...prev, {id: svc.id, nama: svc.nama, harga: svc.harga, q: 1}]
    })
    setEs(''); setEl([])
  }

  const addEditPart = (prd) => {
    setEditParts(prev => {
      if (prev.find(x => x.id === prd.id)) return prev
      return [...prev, {id: prd.id, nama: prd.nama, hj: prd.harga_jual, hm: prd.harga_modal, q: 1}]
    })
    setEp(''); setEpl([])
  }

  const saveEdit = async () => {
    if (!woEdit) return
    await s.from('work_order_services').delete().eq('work_order_id', woEdit.id)
    await s.from('work_order_parts').delete().eq('work_order_id', woEdit.id)

    for (const i of editServices) {
      await s.from('work_order_services').insert({
        work_order_id: woEdit.id, service_id: i.id, nama_jasa: i.nama, harga: i.harga, qty: i.q
      })
    }
    for (const i of editParts) {
      await s.from('work_order_parts').insert({
        work_order_id: woEdit.id, product_id: i.id, nama_part: i.nama,
        harga_jual: i.hj, harga_modal: i.hm||0, qty: i.q
      })
    }

    const tj = editServices.reduce((s,x) => s + x.harga * x.q, 0)
    const tp = editParts.reduce((s,x) => s + x.hj * x.q, 0)
    const th = editParts.reduce((s,x) => s + (x.hm||0) * x.q, 0)
    await s.from('work_orders').update({subtotal_jasa: tj, subtotal_part: tp, total_hpp: th, total: tj+tp}).eq('id', woEdit.id)

    showToast('✅ Work order diupdate!','success')
    setModalEdit(false); load()
  }

  const editTotal = editServices.reduce((s,x)=>s+x.harga*x.q,0) + editParts.reduce((s,x)=>s+x.hj*x.q,0)

  const openBayar = (wo) => { setWoBayar(wo); setMetode('tunai'); setBayar(wo.total||0); setModalBayar(true) }

  const prosesBayar = async () => {
    if (bayar < (woBayar.total||0)) return showToast('Uang tidak cukup!','error')
    const km = bayar - (woBayar.total||0)
    await s.from('work_orders').update({status:'lunas', metode_bayar:metode, bayar, kembalian:km}).eq('id',woBayar.id)
    showToast(`✅ Lunas! Kembali: Rp ${km.toLocaleString('id-ID')}`,'success')
    setModalBayar(false); load()
  }

  const openCetak = async (woId) => {
    const {data: wo} = await s.from('work_orders').select('*, customers(*)').eq('id',woId).single()
    const {data: sv} = await s.from('work_order_services').select('*').eq('work_order_id',woId)
    const {data: pt} = await s.from('work_order_parts').select('*').eq('work_order_id',woId)
    const {data: tn} = await s.from('tenants').select('*').limit(1).single()
    setCetakData({ wo, customer: wo?.customers, services: sv||[], parts: pt||[], tenant: tn })
  }

  const statusList = ['semua','menunggu','dikerjakan','selesai','lunas']
  const statusColor = { menunggu:'bg-amber-100 text-amber-700', dikerjakan:'bg-blue-100 text-blue-700', selesai:'bg-green-100 text-green-700', lunas:'bg-emerald-100 text-emerald-700' }

  return (
    <div>
      {/* Cetak struk */}
      {cetakData && (
        <div className="print-only">
          <StrukPrint wo={cetakData.wo} customer={cetakData.customer} services={cetakData.services} parts={cetakData.parts} tenant={cetakData.tenant} />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><ClipboardList className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Work Order</h1><p className="text-xs text-gray-500">Manajemen status servis bengkel</p></div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {statusList.map(st => (
          <button key={st} onClick={()=>setFilter(st)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap ${filter===st?'bg-blue-600 text-white shadow-sm':'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {st==='semua'?'Semua':st}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none" placeholder="Cari no nota..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden divide-y divide-gray-50">
        {data.map(wo => (
          <div key={wo.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-bold text-gray-900">{wo.no_nota}</span>
                  <span className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${statusColor[wo.status]}`}>{wo.status}</span>
                </div>
                <div className="text-sm text-gray-500">{wo.customers?.plat_nomor} - {wo.customers?.nama}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">Rp {(wo.total||0).toLocaleString('id-ID')}</span>

                {wo.status !== 'lunas' &&
                  <button onClick={()=>openEdit(wo)} className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                    <Pencil className="w-3.5 h-3.5"/> Edit
                  </button>}

                {wo.status === 'menunggu' &&
                  <button onClick={()=>updateStatus(wo.id,'dikerjakan')} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">Kerjakan</button>}
                {wo.status === 'dikerjakan' &&
                  <button onClick={()=>updateStatus(wo.id,'selesai')} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700">Selesai</button>}
                {wo.status === 'selesai' &&
                  <button onClick={()=>openBayar(wo)} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-700">💳 Bayar</button>}
                {wo.status === 'lunas' &&
                  <button onClick={()=>openCetak(wo.id)} className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                    🖨️ Cetak
                  </button>}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        ))}
        {data.length===0 && <div className="p-12 text-center text-gray-300">Belum ada work order</div>}
      </div>

      {/* MODAL EDIT */}
      <Modal open={modalEdit} onClose={()=>setModalEdit(false)} title="✏️ Edit Work Order">
        {woEdit && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{woEdit.no_nota}</p>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2"><Wrench className="w-4 h-4 text-blue-600"/><span className="font-medium text-sm">Jasa Servis</span></div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none text-sm" placeholder="Cari & klik untuk tambah jasa..." value={es} onChange={e=>setEs(e.target.value)} />
                {el.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-xl mt-1 shadow-xl max-h-32 overflow-y-auto">
                    {el.map(x => (
                      <div key={x.id} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b text-sm flex justify-between" onClick={() => addEditService(x)}>
                        <span>{x.nama}</span><span className="text-blue-600">Rp {x.harga.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {editServices.map((x,i) => (
                <div key={x._uid||i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl mb-1.5">
                  <span className="flex-1 text-sm truncate">{x.nama}</span>
                  <input className="w-14 p-1 border rounded-lg text-sm text-center" value={x.q} onChange={e=>{const v=[...editServices]; v[i].q=Math.max(1,Number(e.target.value)); setEditServices(v)}} />
                  <input className="w-20 p-1 border rounded-lg text-sm text-right" value={x.harga} onChange={e=>{const v=[...editServices]; v[i].harga=Number(e.target.value); setEditServices(v)}} />
                  <button onClick={()=>setEditServices(editServices.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-blue-600"/><span className="font-medium text-sm">Sparepart</span></div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none text-sm" placeholder="Cari & klik untuk tambah sparepart..." value={ep} onChange={e=>setEp(e.target.value)} />
                {epl.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-xl mt-1 shadow-xl max-h-32 overflow-y-auto">
                    {epl.map(x => (
                      <div key={x.id} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b text-sm flex justify-between" onClick={() => addEditPart(x)}>
                        <span>{x.nama} <span className="text-gray-400">(stok:{x.stok})</span></span><span className="text-blue-600">Rp {x.harga_jual.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {editParts.map((x,i) => (
                <div key={x._uid||i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl mb-1.5">
                  <span className="flex-1 text-sm truncate">{x.nama}</span>
                  <input className="w-14 p-1 border rounded-lg text-sm text-center" value={x.q} onChange={e=>{const v=[...editParts]; v[i].q=Math.max(1,Number(e.target.value)); setEditParts(v)}} />
                  <input className="w-20 p-1 border rounded-lg text-sm text-right" value={x.hj} onChange={e=>{const v=[...editParts]; v[i].hj=Number(e.target.value); setEditParts(v)}} />
                  <button onClick={()=>setEditParts(editParts.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-3 rounded-xl text-right mb-4">
              <span className="text-sm text-gray-500">Total: </span>
              <span className="text-xl font-bold text-gray-900">Rp {editTotal.toLocaleString('id-ID')}</span>
            </div>
            <button onClick={saveEdit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">💾 Simpan Perubahan</button>
          </div>
        )}
      </Modal>

      {/* MODAL BAYAR */}
      <Modal open={modalBayar} onClose={()=>setModalBayar(false)} title="💳 Pembayaran">
        {woBayar && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">{woBayar.no_nota}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">Rp {(woBayar.total||0).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Metode Bayar</label>
              <select className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white" value={metode} onChange={e=>setMetode(e.target.value)}>
                <option value="tunai">💰 Tunai</option><option value="transfer">🏦 Transfer</option><option value="qris">📱 QRIS</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Jumlah Dibayar</label>
              <input type="number" className="w-full px-4 py-2.5 border rounded-xl outline-none font-bold text-lg" value={bayar} onChange={e=>setBayar(Number(e.target.value))} />
            </div>
            {bayar >= (woBayar.total||0) && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <p className="text-sm text-gray-500">Kembalian</p>
                <p className="text-2xl font-bold text-emerald-600">Rp {(bayar-(woBayar.total||0)).toLocaleString('id-ID')}</p>
              </div>
            )}
            <button onClick={prosesBayar} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 text-lg">✅ Konfirmasi Pembayaran</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
