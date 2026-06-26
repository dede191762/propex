'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [tab, setTab] = useState('dashboard')
  const [musteriler, setMusteriler] = useState<any[]>([])
  const [mulkler, setMulkler] = useState<any[]>([])
  const [gorusmeler, setGorusmeler] = useState<any[]>([])
  const [komisyonlar, setKomisyonlar] = useState<any[]>([])
  const [hatirlaticilar, setHatirlaticilar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<string|null>(null)
  const [form, setForm] = useState<any>({})
  const [galeriMulk, setGaleriMulk] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const NAVY = '#0f1428'
  const GOLD = '#c9a84c'
  const SLATE = '#64748b'

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [m, mu, g, k, h] = await Promise.all([
      supabase.from('musteriler').select('*').order('created_at', { ascending: false }),
      supabase.from('mulkler').select('*').order('created_at', { ascending: false }),
      supabase.from('gorusmeler').select('*').order('created_at', { ascending: false }),
      supabase.from('komisyonlar').select('*').order('created_at', { ascending: false }),
      supabase.from('hatirlaticilar').select('*').order('created_at', { ascending: false }),
    ])
    setMusteriler(m.data || [])
    setMulkler(mu.data || [])
    setGorusmeler(g.data || [])
    setKomisyonlar(k.data || [])
    setHatirlaticilar(h.data || [])
    setLoading(false)
  }

  async function musteriKaydet() {
    if (!form.ad) return alert('Ad zorunlu')
    if (form.id) { await supabase.from('musteriler').update(form).eq('id', form.id) }
    else { await supabase.from('musteriler').insert(form) }
    setModal(null); loadAll()
  }
  async function musteriSil(id: string) {
    if (!confirm('Silinsin mi?')) return
    await supabase.from('musteriler').delete().eq('id', id); loadAll()
  }

  async function mulkKaydet() {
    if (!form.baslik) return alert('Başlık zorunlu')
    if (form.id) { await supabase.from('mulkler').update(form).eq('id', form.id) }
    else { await supabase.from('mulkler').insert({ ...form, fotograflar: [], belgeler: [] }) }
    setModal(null); loadAll()
  }
  async function mulkSil(id: string) {
    if (!confirm('Silinsin mi?')) return
    await supabase.from('mulkler').delete().eq('id', id); loadAll()
  }

  async function fotografYukle(mulkId: string, file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${mulkId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('mulk-fotograflari').upload(path, file)
    if (error) { alert('Yükleme hatası: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('mulk-fotograflari').getPublicUrl(path)
    const mulk = mulkler.find(m => m.id === mulkId)
    const mevcutFotolar = mulk?.fotograflar || []
    await supabase.from('mulkler').update({ fotograflar: [...mevcutFotolar, { url: data.publicUrl, path }] }).eq('id', mulkId)
    setUploading(false); loadAll()
  }

  async function fotografSil(mulkId: string, foto: any) {
    await supabase.storage.from('mulk-fotograflari').remove([foto.path])
    const mulk = mulkler.find(m => m.id === mulkId)
    const yeniFotolar = (mulk?.fotograflar || []).filter((f: any) => f.path !== foto.path)
    await supabase.from('mulkler').update({ fotograflar: yeniFotolar }).eq('id', mulkId)
    loadAll()
  }

  async function gorusmeKaydet() {
    if (!form.konu) return alert('Konu zorunlu')
    if (form.id) { await supabase.from('gorusmeler').update(form).eq('id', form.id) }
    else { await supabase.from('gorusmeler').insert(form) }
    setModal(null); loadAll()
  }
  async function gorusmeSil(id: string) {
    if (!confirm('Silinsin mi?')) return
    await supabase.from('gorusmeler').delete().eq('id', id); loadAll()
  }
  async function gorusmeToggle(id: string, val: boolean) {
    await supabase.from('gorusmeler').update({ tamamlandi: !val }).eq('id', id); loadAll()
  }

  async function komisyonKaydet() {
    if (!form.tutar) return alert('Tutar zorunlu')
    if (form.id) { await supabase.from('komisyonlar').update(form).eq('id', form.id) }
    else { await supabase.from('komisyonlar').insert(form) }
    setModal(null); loadAll()
  }
  async function komisyonSil(id: string) {
    if (!confirm('Silinsin mi?')) return
    await supabase.from('komisyonlar').delete().eq('id', id); loadAll()
  }
  async function komisyonToggle(id: string, val: boolean) {
    await supabase.from('komisyonlar').update({ odendi: !val }).eq('id', id); loadAll()
  }

  async function hatirlaticiKaydet() {
    if (!form.baslik) return alert('Başlık zorunlu')
    if (form.id) { await supabase.from('hatirlaticilar').update(form).eq('id', form.id) }
    else { await supabase.from('hatirlaticilar').insert(form) }
    setModal(null); loadAll()
  }
  async function hatirlaticiSil(id: string) {
    if (!confirm('Silinsin mi?')) return
    await supabase.from('hatirlaticilar').delete().eq('id', id); loadAll()
  }
  async function hatirlaticiToggle(id: string, val: boolean) {
    await supabase.from('hatirlaticilar').update({ tamamlandi: !val }).eq('id', id); loadAll()
  }

  const inp: any = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', fontFamily: 'inherit' }
  const sel: any = { ...inp, cursor: 'pointer' }
  const btnP: any = { background: GOLD, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }
  const btnS: any = { background: '#f8fafc', color: NAVY, border: '1.5px solid #e2e8f0', padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', marginRight: 6 }
  const btnD: any = { background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }

  const navSt = (key: string): any => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
    color: tab === key ? '#fff' : '#94a3b8',
    background: tab === key ? GOLD : 'transparent',
    border: 'none', width: '100%', textAlign: 'left', marginBottom: 4,
  })

  const Modal = ({ title, children, onClose }: any) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: NAVY }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )

  const stats = {
    toplamMusteri: musteriler.length,
    satillik: mulkler.filter(m => m.islem === 'Satılık' && m.durum === 'Aktif').length,
    kiralik: mulkler.filter(m => m.islem === 'Kiralık' && m.durum === 'Aktif').length,
    bekleyenGor: gorusmeler.filter(g => !g.tamamlandi).length,
    bekleyenHat: hatirlaticilar.filter(h => !h.tamamlandi).length,
    toplamKom: komisyonlar.reduce((s, k) => s + Number(k.tutar || 0), 0),
    odenenKom: komisyonlar.filter(k => k.odendi).reduce((s, k) => s + Number(k.tutar || 0), 0),
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: SLATE }}>
      Yükleniyor...
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <aside style={{ width: 210, background: NAVY, padding: '24px 10px', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28, paddingLeft: 8 }}>
          <div style={{ color: GOLD, fontWeight: 800, fontSize: 20, fontFamily: 'Georgia,serif' }}>Propex</div>
          <div style={{ color: '#475569', fontSize: 11 }}>Emlak Yönetim Paneli</div>
        </div>
        {[
          { key: 'dashboard', label: '🏠 Genel Bakış' },
          { key: 'musteriler', label: '👥 Müşteriler' },
          { key: 'mulkler', label: '🏢 Mülkler' },
          { key: 'gorusmeler', label: `💬 Görüşmeler ${stats.bekleyenGor > 0 ? `(${stats.bekleyenGor})` : ''}` },
          { key: 'komisyonlar', label: '💰 Komisyonlar' },
          { key: 'hatirlatici', label: `🔔 Hatırlatıcılar ${stats.bekleyenHat > 0 ? `(${stats.bekleyenHat})` : ''}` },
        ].map(({ key, label }) => (
          <button key={key} style={navSt(key)} onClick={() => setTab(key)}>{label}</button>
        ))}
      </aside>

      <main style={{ marginLeft: 210, flex: 1, padding: 28 }}>

        {tab === 'dashboard' && (
          <div>
            <h2 style={{ color: NAVY, marginBottom: 20 }}>Genel Bakış</h2>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { label: 'Müşteri', val: stats.toplamMusteri },
                { label: 'Satılık', val: stats.satillik },
                { label: 'Kiralık', val: stats.kiralik },
                { label: 'Bekleyen Görüşme', val: stats.bekleyenGor },
                { label: 'Hatırlatıcı', val: stats.bekleyenHat },
                { label: 'Toplam Komisyon', val: stats.toplamKom.toLocaleString('tr-TR') + ' ₺' },
                { label: 'Ödenen', val: stats.odenenKom.toLocaleString('tr-TR') + ' ₺' },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', flex: '1 1 130px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, fontFamily: 'Georgia,serif' }}>{val}</div>
                  <div style={{ fontSize: 11, color: SLATE, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 12px', color: NAVY }}>Bekleyen Görüşmeler</h4>
                {gorusmeler.filter(g => !g.tamamlandi).slice(0, 5).map(g => {
                  const mu = musteriler.find(m => m.id === g.musteri_id)
                  return (
                    <div key={g.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{g.konu}</div>
                        <div style={{ fontSize: 11, color: SLATE }}>{mu?.ad} · {g.tarih}</div>
                      </div>
                      <button onClick={() => gorusmeToggle(g.id, g.tamamlandi)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#166534', fontWeight: 700 }}>✓</button>
                    </div>
                  )
                })}
                {stats.bekleyenGor === 0 && <p style={{ color: SLATE, fontSize: 13 }}>Bekleyen yok 🎉</p>}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 12px', color: NAVY }}>Yaklaşan Hatırlatıcılar</h4>
                {hatirlaticilar.filter(h => !h.tamamlandi).slice(0, 5).map(h => (
                  <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{h.baslik}</div>
                      <div style={{ fontSize: 11, color: SLATE }}>{h.tarih} {h.saat}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: h.oncelik === 'Yüksek' ? '#be123c' : h.oncelik === 'Orta' ? '#854d0e' : '#166534' }}>{h.oncelik}</span>
                  </div>
                ))}
                {stats.bekleyenHat === 0 && <p style={{ color: SLATE, fontSize: 13 }}>Hatırlatıcı yok 🎉</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'musteriler' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: NAVY }}>Müşteriler</h2>
              <button style={btnP} onClick={() => { setForm({ tip: 'Alıcı', durum: 'Aktif' }); setModal('musteri') }}>+ Yeni Müşteri</button>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Ad Soyad', 'Telefon', 'Tip', 'Durum', 'Notlar', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: SLATE, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {musteriler.map(m => (
                    <tr key={m.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: NAVY }}>{m.ad}</td>
                      <td style={{ padding: '12px 14px', color: SLATE, fontSize: 13 }}>{m.telefon}</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{m.tip}</span></td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: m.durum === 'Aktif' ? '#f0fdf4' : '#f8fafc', color: m.durum === 'Aktif' ? '#166534' : SLATE, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{m.durum}</span></td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: SLATE, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notlar}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button style={btnS} onClick={() => { setForm({ ...m }); setModal('musteri') }}>Düzenle</button>
                        <button style={btnD} onClick={() => musteriSil(m.id)}>Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {musteriler.length === 0 && <p style={{ textAlign: 'center', color: SLATE, padding: 32 }}>Henüz müşteri yok.</p>}
            </div>
          </div>
        )}

        {tab === 'mulkler' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: NAVY }}>Mülkler</h2>
              <button style={btnP} onClick={() => { setForm({ tip: 'Daire', islem: 'Satılık', durum: 'Aktif' }); setModal('mulk') }}>+ Yeni Mülk</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {mulkler.map(m => {
                const fotolar = m.fotograflar || []
                return (
                  <div key={m.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${m.durum === 'Aktif' ? GOLD : '#cbd5e1'}` }}>
                    {fotolar.length > 0 && (
                      <img src={fotolar[0].url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    )}
                    {fotolar.length === 0 && (
                      <div style={{ width: '100%', height: 100, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: SLATE, fontSize: 13 }}>
                        📷 Fotoğraf yok
                      </div>
                    )}
                    <div style={{ padding: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: NAVY, marginBottom: 4 }}>{m.baslik}</div>
                      <div style={{ fontSize: 12, color: SLATE, marginBottom: 8 }}>{m.konum}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: NAVY, fontFamily: 'Georgia,serif', marginBottom: 8 }}>{Number(m.fiyat || 0).toLocaleString('tr-TR')} ₺</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{m.islem}</span>
                        <span style={{ background: '#f8fafc', color: SLATE, padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.tip}</span>
                        {m.m2 && <span style={{ background: '#f8fafc', color: SLATE, padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.m2} m²</span>}
                      </div>
                      {m.notlar && <div style={{ fontSize: 12, color: SLATE, marginBottom: 10, padding: '6px 10px', background: '#f8fafc', borderRadius: 7 }}>{m.notlar}</div>}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button style={btnS} onClick={() => { setForm({ ...m }); setModal('mulk') }}>Düzenle</button>
                        <button style={{ ...btnS, color: '#7e22ce', borderColor: '#e9d5ff' }} onClick={() => { setGaleriMulk(m); setModal('galeri') }}>📷 Fotoğraflar {fotolar.length > 0 ? `(${fotolar.length})` : ''}</button>
                        <button style={btnD} onClick={() => mulkSil(m.id)}>Sil</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {mulkler.length === 0 && <p style={{ textAlign: 'center', color: SLATE, padding: 32 }}>Henüz mülk yok.</p>}
          </div>
        )}

        {tab === 'gorusmeler' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: NAVY }}>Görüşmeler</h2>
              <button style={btnP} onClick={() => { setForm({ musteri_id: musteriler[0]?.id, tarih: new Date().toISOString().split('T')[0], tamamlandi: false }); setModal('gorusme') }}>+ Yeni Görüşme</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gorusmeler.map(g => {
                const mu = musteriler.find(m => m.id === g.musteri_id)
                return (
                  <div key={g.id} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: g.tamamlandi ? 0.6 : 1, borderLeft: `4px solid ${g.tamamlandi ? '#cbd5e1' : GOLD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: NAVY, textDecoration: g.tamamlandi ? 'line-through' : 'none' }}>{g.konu}</div>
                        <div style={{ fontSize: 12, color: SLATE, marginTop: 4 }}>👤 {mu?.ad} · 📅 {g.tarih}</div>
                        {g.notlar && <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>{g.notlar}</div>}
                        {g.sonraki_adim && !g.tamamlandi && <div style={{ marginTop: 8, fontSize: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 7, padding: '6px 10px', color: '#92400e' }}>➜ {g.sonraki_adim}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={btnS} onClick={() => gorusmeToggle(g.id, g.tamamlandi)}>{g.tamamlandi ? '↩' : '✓'}</button>
                        <button style={btnS} onClick={() => { setForm({ ...g }); setModal('gorusme') }}>Düzenle</button>
                        <button style={btnD} onClick={() => gorusmeSil(g.id)}>Sil</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {gorusmeler.length === 0 && <p style={{ textAlign: 'center', color: SLATE, padding: 32 }}>Henüz görüşme yok.</p>}
          </div>
        )}

        {tab === 'komisyonlar' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: NAVY }}>Komisyonlar</h2>
              <button style={btnP} onClick={() => { setForm({ tip: 'Satış', odendi: false, tarih: new Date().toISOString().split('T')[0] }); setModal('komisyon') }}>+ Yeni Komisyon</button>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Toplam', val: stats.toplamKom, color: NAVY },
                { label: 'Ödenen', val: stats.odenenKom, color: '#166534' },
                { label: 'Bekleyen', val: stats.toplamKom - stats.odenenKom, color: '#dc2626' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Georgia,serif' }}>{val.toLocaleString('tr-TR')} ₺</div>
                  <div style={{ fontSize: 11, color: SLATE, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Müşteri', 'Tip', 'Tutar', 'Tarih', 'Durum', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: SLATE, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {komisyonlar.map(k => {
                    const mu = musteriler.find(m => m.id === k.musteri_id)
                    return (
                      <tr key={k.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: NAVY }}>{mu?.ad || '—'}</td>
                        <td style={{ padding: '12px 14px', color: SLATE, fontSize: 13 }}>{k.tip}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'Georgia,serif' }}>{Number(k.tutar || 0).toLocaleString('tr-TR')} ₺</td>
                        <td style={{ padding: '12px 14px', color: SLATE, fontSize: 13 }}>{k.tarih}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <button onClick={() => komisyonToggle(k.id, k.odendi)} style={{ background: k.odendi ? '#f0fdf4' : '#fff7ed', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: k.odendi ? '#166534' : '#ea580c', fontWeight: 600, fontSize: 12 }}>
                            {k.odendi ? '✓ Ödendi' : '⧗ Bekliyor'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button style={btnS} onClick={() => { setForm({ ...k }); setModal('komisyon') }}>Düzenle</button>
                          <button style={btnD} onClick={() => komisyonSil(k.id)}>Sil</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {komisyonlar.length === 0 && <p style={{ textAlign: 'center', color: SLATE, padding: 32 }}>Henüz komisyon yok.</p>}
            </div>
          </div>
        )}

        {tab === 'hatirlatici' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: NAVY }}>Hatırlatıcılar</h2>
              <button style={btnP} onClick={() => { setForm({ tarih: new Date().toISOString().split('T')[0], saat: '09:00', oncelik: 'Orta', tamamlandi: false }); setModal('hatirlatici') }}>+ Yeni Hatırlatıcı</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hatirlaticilar.map(h => {
                const mu = musteriler.find(m => m.id === h.musteri_id)
                return (
                  <div key={h.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: h.tamamlandi ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 14, borderLeft: `4px solid ${h.tamamlandi ? '#cbd5e1' : GOLD}` }}>
                    <button onClick={() => hatirlaticiToggle(h.id, h.tamamlandi)} style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${h.tamamlandi ? '#166534' : GOLD}`, background: h.tamamlandi ? '#f0fdf4' : 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                      {h.tamamlandi && '✓'}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: NAVY, textDecoration: h.tamamlandi ? 'line-through' : 'none' }}>{h.baslik}</div>
                      <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>📅 {h.tarih} {h.saat && `· 🕐 ${h.saat}`} {mu && `· 👤 ${mu.ad}`}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: h.oncelik === 'Yüksek' ? '#fff1f2' : h.oncelik === 'Orta' ? '#fef9c3' : '#f0fdf4', color: h.oncelik === 'Yüksek' ? '#be123c' : h.oncelik === 'Orta' ? '#854d0e' : '#166534' }}>{h.oncelik}</span>
                    <button style={btnS} onClick={() => { setForm({ ...h }); setModal('hatirlatici') }}>Düzenle</button>
                    <button style={btnD} onClick={() => hatirlaticiSil(h.id)}>Sil</button>
                  </div>
                )
              })}
            </div>
            {hatirlaticilar.length === 0 && <p style={{ textAlign: 'center', color: SLATE, padding: 32 }}>Henüz hatırlatıcı yok.</p>}
          </div>
        )}
      </main>

      {modal === 'musteri' && (
        <Modal title={form.id ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'} onClose={() => setModal(null)}>
          <input style={inp} placeholder="Ad Soyad *" value={form.ad || ''} onChange={e => setForm({ ...form, ad: e.target.value })} />
          <input style={inp} placeholder="Telefon" value={form.telefon || ''} onChange={e => setForm({ ...form, telefon: e.target.value })} />
          <input style={inp} placeholder="E-posta" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
          <select style={sel} value={form.tip || 'Alıcı'} onChange={e => setForm({ ...form, tip: e.target.value })}>
            {['Alıcı', 'Satıcı', 'Kiracı'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={sel} value={form.durum || 'Aktif'} onChange={e => setForm({ ...form, durum: e.target.value })}>
            {['Aktif', 'Pasif'].map(t => <option key={t}>{t}</option>)}
          </select>
          <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Notlar" value={form.notlar || ''} onChange={e => setForm({ ...form, notlar: e.target.value })} />
          <button style={{ ...btnP, width: '100%' }} onClick={musteriKaydet}>Kaydet</button>
        </Modal>
      )}

      {modal === 'mulk' && (
        <Modal title={form.id ? 'Mülkü Düzenle' : 'Yeni Mülk'} onClose={() => setModal(null)}>
          <input style={inp} placeholder="Başlık *" value={form.baslik || ''} onChange={e => setForm({ ...form, baslik: e.target.value })} />
          <select style={sel} value={form.tip || 'Daire'} onChange={e => setForm({ ...form, tip: e.target.value })}>
            {['Daire', 'Villa', 'Ofis', 'Arsa', 'İş Yeri'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={sel} value={form.islem || 'Satılık'} onChange={e => setForm({ ...form, islem: e.target.value })}>
            {['Satılık', 'Kiralık'].map(t => <option key={t}>{t}</option>)}
          </select>
          <input style={inp} placeholder="Fiyat (₺)" value={form.fiyat || ''} onChange={e => setForm({ ...form, fiyat: e.target.value })} />
          <input style={inp} placeholder="Konum" value={form.konum || ''} onChange={e => setForm({ ...form, konum: e.target.value })} />
          <input style={inp} placeholder="m²" value={form.m2 || ''} onChange={e => setForm({ ...form, m2: e.target.value })} />
          <select style={sel} value={form.durum || 'Aktif'} onChange={e => setForm({ ...form, durum: e.target.value })}>
            {['Aktif', 'Satıldı', 'Kiralandı', 'Pasif'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={sel} value={form.musteri_id || ''} onChange={e => setForm({ ...form, musteri_id: e.target.value || null })}>
            <option value=''>— Müşteri Seç —</option>
            {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
          </select>
          <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Notlar" value={form.notlar || ''} onChange={e => setForm({ ...form, notlar: e.target.value })} />
          <button style={{ ...btnP, width: '100%' }} onClick={mulkKaydet}>Kaydet</button>
        </Modal>
      )}

      {modal === 'galeri' && galeriMulk && (
        <Modal title={`📷 Fotoğraflar — ${galeriMulk.baslik}`} onClose={() => { setModal(null); setGaleriMulk(null) }}>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={async e => {
              const files = Array.from(e.target.files || [])
              for (const file of files) { await fotografYukle(galeriMulk.id, file) }
              loadAll()
            }}
          />
          <button style={{ ...btnP, width: '100%', marginBottom: 16, justifyContent: 'center' }}
            onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? '⏳ Yükleniyor...' : '📁 Bilgisayardan Fotoğraf Seç'}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {(mulkler.find(m => m.id === galeriMulk.id)?.fotograflar || []).map((f: any, i: number) => (
              <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => fotografSil(galeriMulk.id, f)}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>✕</button>
              </div>
            ))}
          </div>
          {(mulkler.find(m => m.id === galeriMulk.id)?.fotograflar || []).length === 0 &&
            <p style={{ textAlign: 'center', color: SLATE, fontSize: 13, marginTop: 16 }}>Henüz fotoğraf yok. Yukarıdan ekle!</p>}
        </Modal>
      )}

      {modal === 'gorusme' && (
        <Modal title={form.id ? 'Görüşmeyi Düzenle' : 'Yeni Görüşme'} onClose={() => setModal(null)}>
          <select style={sel} value={form.musteri_id || ''} onChange={e => setForm({ ...form, musteri_id: e.target.value })}>
            <option value=''>— Müşteri Seç —</option>
            {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
          </select>
          <input style={inp} placeholder="Konu *" value={form.konu || ''} onChange={e => setForm({ ...form, konu: e.target.value })} />
          <input type="date" style={inp} value={form.tarih || ''} onChange={e => setForm({ ...form, tarih: e.target.value })} />
          <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Notlar" value={form.notlar || ''} onChange={e => setForm({ ...form, notlar: e.target.value })} />
          <input style={inp} placeholder="Sonraki Adım" value={form.sonraki_adim || ''} onChange={e => setForm({ ...form, sonraki_adim: e.target.value })} />
          <button style={{ ...btnP, width: '100%' }} onClick={gorusmeKaydet}>Kaydet</button>
        </Modal>
      )}

      {modal === 'komisyon' && (
        <Modal title={form.id ? 'Komisyonu Düzenle' : 'Yeni Komisyon'} onClose={() => setModal(null)}>
          <select style={sel} value={form.musteri_id || ''} onChange={e => setForm({ ...form, musteri_id: e.target.value || null })}>
            <option value=''>— Müşteri Seç —</option>
            {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
          </select>
          <select style={sel} value={form.mulk_id || ''} onChange={e => setForm({ ...form, mulk_id: e.target.value || null })}>
            <option value=''>— Mülk Seç —</option>
            {mulkler.map(m => <option key={m.id} value={m.id}>{m.baslik}</option>)}
          </select>
          <select style={sel} value={form.tip || 'Satış'} onChange={e => setForm({ ...form, tip: e.target.value })}>
            {['Satış', 'Kiralama', 'Danışmanlık'].map(t => <option key={t}>{t}</option>)}
          </select>
          <input style={inp} placeholder="Tutar (₺) *" value={form.tutar || ''} onChange={e => setForm({ ...form, tutar: e.target.value })} />
          <input type="date" style={inp} value={form.tarih || ''} onChange={e => setForm({ ...form, tarih: e.target.value })} />
          <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="Notlar" value={form.notlar || ''} onChange={e => setForm({ ...form, notlar: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.odendi} onChange={e => setForm({ ...form, odendi: e.target.checked })} />
            Ödendi
          </label>
          <button style={{ ...btnP, width: '100%' }} onClick={komisyonKaydet}>Kaydet</button>
        </Modal>
      )}

      {modal === 'hatirlatici' && (
        <Modal title={form.id ? 'Hatırlatıcıyı Düzenle' : 'Yeni Hatırlatıcı'} onClose={() => setModal(null)}>
          <input style={inp} placeholder="Başlık *" value={form.baslik || ''} onChange={e => setForm({ ...form, baslik: e.target.value })} />
          <input type="date" style={inp} value={form.tarih || ''} onChange={e => setForm({ ...form, tarih: e.target.value })} />
          <input type="time" style={inp} value={form.saat || ''} onChange={e => setForm({ ...form, saat: e.target.value })} />
          <select style={sel} value={form.musteri_id || ''} onChange={e => setForm({ ...form, musteri_id: e.target.value || null })}>
            <option value=''>— Müşteri Seç —</option>
            {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
          </select>
          <select style={sel} value={form.oncelik || 'Orta'} onChange={e => setForm({ ...form, oncelik: e.target.value })}>
            {['Yüksek', 'Orta', 'Düşük'].map(t => <option key={t}>{t}</option>)}
          </select>
          <button style={{ ...btnP, width: '100%' }} onClick={hatirlaticiKaydet}>Kaydet</button>
        </Modal>
      )}
    </div>
  )
}
Yapıştırınca Ctrl+S kaydet, kapat, söyle!
