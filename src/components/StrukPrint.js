'use client'
import { useEffect } from 'react'

export default function StrukPrint({ wo, customer, services, parts, tenant }) {
  useEffect(() => {
    setTimeout(() => {
      window.print()
    }, 300)
  }, [])

  return (
    <div className="print-area" style={{ fontFamily: "'Courier New', monospace", color: '#000', background: '#fff', padding: '10px 5px', width: '72mm', margin: '0 auto' }}>
      <style>{`
        @page { margin: 0; size: 80mm auto; }
        body { margin: 0; padding: 0; }
        @media print { .no-print { display: none !important; } }
        .sh { text-align: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #000; }
        .sh h2 { margin: 0 0 4px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .sh p { margin: 1px 0; font-size: 10px; }
        .sd { border-top: 1px dashed #000; margin: 5px 0; }
        .sr { display: flex; justify-content: space-between; padding: 1px 0; font-size: 11px; }
        .sr.b { font-weight: bold; font-size: 13px; border-top: 1px dashed #000; padding-top: 3px; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 4px 0; }
        th { text-align: left; padding: 2px 0; border-bottom: 1px dashed #000; font-size: 10px; text-transform: uppercase; }
        td { padding: 2px 0; vertical-align: top; }
        .sf { text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #000; }
        .sf p { margin: 2px 0; font-size: 11px; }
        .lunas { text-align: center; margin: 8px 0; padding: 4px; border: 2px solid #000; font-weight: bold; font-size: 14px; letter-spacing: 2px; }
      `}</style>

      <div className="sh">
        <h2>{(tenant?.nama_bengkel || 'BENGKEL').toUpperCase()}</h2>
        <p>{tenant?.alamat || ''}</p>
        <p>Telp: {tenant?.no_telp || '-'}</p>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',fontSize:10}}>
        <span>No: {wo.no_nota}</span>
        <span>{new Date(wo.created_at).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</span>
      </div>
      <div className="sd"></div>

      <div style={{fontSize:11,marginBottom:4}}>
        <p style={{margin:'1px 0'}}>Nama: {customer?.nama || '-'}</p>
        <p style={{margin:'1px 0'}}>Motor: {[customer?.plat_nomor,customer?.merek,customer?.tipe].filter(Boolean).join(' ')}</p>
        <p style={{margin:'1px 0'}}>No HP: {customer?.no_hp || '-'}</p>
      </div>
      <div className="sd"></div>

      {services.length > 0 && (
        <>
          <p style={{fontSize:10,fontWeight:'bold',marginBottom:2}}>-- JASA SERVIS --</p>
          <table><thead><tr><th style={{width:'55%'}}>Item</th><th style={{width:'15%',textAlign:'center'}}>Qty</th><th style={{width:'30%',textAlign:'right'}}>Harga</th></tr></thead>
            <tbody>{services.map((s,i)=>(
              <tr key={i}><td>{s.nama_jasa}</td><td style={{textAlign:'center'}}>{s.qty}</td><td style={{textAlign:'right'}}>Rp {(s.harga*s.qty).toLocaleString('id-ID')}</td></tr>
            ))}</tbody>
          </table>
        </>
      )}

      {parts.length > 0 && (
        <>
          <p style={{fontSize:10,fontWeight:'bold',marginBottom:2,marginTop:4}}>-- SPAREPART --</p>
          <table><thead><tr><th style={{width:'55%'}}>Item</th><th style={{width:'15%',textAlign:'center'}}>Qty</th><th style={{width:'30%',textAlign:'right'}}>Harga</th></tr></thead>
            <tbody>{parts.map((p,i)=>(
              <tr key={i}><td>{p.nama_part}</td><td style={{textAlign:'center'}}>{p.qty}</td><td style={{textAlign:'right'}}>Rp {(p.harga_jual*p.qty).toLocaleString('id-ID')}</td></tr>
            ))}</tbody>
          </table>
        </>
      )}

      <div className="sd"></div>

      <div className="sr"><span>Subtotal Jasa</span><span>Rp {(wo.subtotal_jasa||0).toLocaleString('id-ID')}</span></div>
      <div className="sr"><span>Subtotal Part</span><span>Rp {(wo.subtotal_part||0).toLocaleString('id-ID')}</span></div>
      {(wo.diskon||0) > 0 && <div className="sr"><span>Diskon</span><span style={{color:'red'}}>-Rp {(wo.diskon||0).toLocaleString('id-ID')}</span></div>}
      <div className="sr b"><span>TOTAL</span><span>Rp {(wo.total||0).toLocaleString('id-ID')}</span></div>
      <div className="sd"></div>
      <div className="sr"><span>Bayar</span><span>Rp {(wo.bayar||0).toLocaleString('id-ID')}</span></div>
      <div className="sr b" style={{fontSize:14,color:'#059669'}}><span>Kembalian</span><span>Rp {(wo.kembalian||0).toLocaleString('id-ID')}</span></div>
      <div className="sr"><span>Metode</span><span>{(wo.metode_bayar||'-').toUpperCase()}</span></div>

      {wo.status === 'lunas' && <div className="lunas">LUNAS</div>}

      <div className="sf">
        <p style={{fontSize:13,fontWeight:'bold',marginBottom:4}}>Terimakasih</p>
        <p>Jangan lupa rutin ganti oli</p>
        <p style={{marginTop:6,fontSize:10,color:'#666'}}>~ Aplikasi Bengkel ~</p>
      </div>
    </div>
  )
}
