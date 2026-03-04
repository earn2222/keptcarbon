import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as turf from '@turf/turf'
import { getPlots, deletePlot } from '../services/api'

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ico = ({ d, d2, s = 1.8, cls = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={s} stroke="currentColor" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        {d2 && <path strokeLinecap="round" strokeLinejoin="round" d={d2} />}
    </svg>
)
const HomeIco = p => <Ico {...p} d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
const MapIco = p => <Ico {...p} d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
const UserIco = p => <Ico {...p} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
const DashIco = p => <Ico {...p} d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
const HistIco = p => <Ico {...p} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
const LeafIco = p => <Ico {...p} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
const TrashIco = p => <Ico {...p} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
const EditIco = p => <Ico {...p} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
const PinIco = p => <Ico {...p} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" d2="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
const SearchIco = p => <Ico {...p} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803 7.5 7.5 0 0 0 15.803 15.803Z" />
const XIco = p => <Ico {...p} d="M6 18 18 6M6 6l12 12" />
const LogoutIco = p => <Ico {...p} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
const CamIco = p => <Ico {...p} d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" d2="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
const ChevIco = p => <Ico {...p} d="m19 9-7 7-7-7" />

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const CARBON_PRICE = 250

const formatArea = (rai) => {
    const rVal = parseFloat(rai) || 0
    const r = Math.floor(rVal)
    const ng = (rVal - r) * 4
    const n = Math.floor(ng)
    const w = Math.round((ng - n) * 100)
    return `${r} ไร่ ${n} งาน ${w} ตารางวา`
}

const getMethodInfo = (method) => {
    if (!method) return { name: 'ภาคสนาม', formula: 'AGB = 0.118 × DBH^2.53', badge: 'ภาคสนาม' }
    const m = String(method).toLowerCase()
    if (m.includes('ndvi')) return { name: 'NDVI', formula: 'AGB = 34.2 × NDVI + 5.8', badge: 'ดาวเทียม' }
    if (m.includes('tcari')) return { name: 'TCARI', formula: 'AGB = 13.57 × TCARI + 7.45', badge: 'ดาวเทียม' }
    if (m.includes('allometric') || m.includes('field2')) return { name: 'Allometric', formula: 'W = 0.0336 × (D²H)^0.931', badge: 'ภาคสนาม' }
    if (m.includes('eq2')) return { name: 'สมการที่ 2', formula: 'AGB = 0.062 × DBH^2.23', badge: 'ภาคสนาม' }
    return { name: 'ภาคสนาม', formula: 'AGB = 0.118 × DBH^2.53', badge: 'ภาคสนาม' }
}

// ─── PROFILE MODAL ────────────────────────────────────────────────────────────
function ProfileModal({ profile, onSave, onClose }) {
    const [form, setForm] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        picture: profile?.picture || '',
    })
    const fileRef = useRef()

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => setForm(f => ({ ...f, picture: ev.target.result }))
        reader.readAsDataURL(file)
    }

    return (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#1a2332', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    <h2 className="text-white font-bold text-base">แก้ไขโปรไฟล์</h2>
                    <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <XIco cls="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center" style={{ borderColor: 'rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.1)' }}>
                            {form.picture ? <img src={form.picture} alt="" className="w-full h-full object-cover" />
                                : <UserIco cls="w-10 h-10 text-emerald-400" />}
                        </div>
                        <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-800" style={{ background: '#10b981' }}>
                            <CamIco cls="w-3.5 h-3.5 text-white" />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </div>
                    <div className="w-full flex flex-col gap-3">
                        {[
                            { label: 'ชื่อ-นามสกุล', key: 'name', type: 'text', ph: 'กรอกชื่อ' },
                            { label: 'อีเมล', key: 'email', type: 'email', ph: 'email@example.com' },
                            { label: 'เบอร์โทร', key: 'phone', type: 'tel', ph: '081-xxx-xxxx' },
                        ].map(({ label, key, type, ph }) => (
                            <div key={key}>
                                <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
                                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder={ph}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { onSave(form); onClose() }}
                        className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────
function DeleteModal({ plot, onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl"
                style={{ background: '#1a2332', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <TrashIco cls="w-7 h-7 text-red-400" />
                </div>
                <div className="text-center">
                    <h3 className="text-white font-bold text-base">ยืนยันการลบ?</h3>
                    <p className="text-slate-400 text-sm mt-1">แปลง <span className="text-white font-semibold">{plot?.farmerName}</span> จะถูกลบถาวร</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-slate-300 font-semibold text-sm transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90" style={{ background: '#ef4444' }}>ลบแปลง</button>
                </div>
            </div>
        </div>
    )
}

// ─── PLOT DETAIL MODAL ────────────────────────────────────────────────────────
function PlotDetailModal({ plot, onClose, onEdit, onDelete }) {
    const [methodIdx, setMethodIdx] = useState(0)
    if (!plot) return null
    const method = getMethodInfo(plot.method)

    const multiMethods = (plot.actualFormulas && plot.actualFormulas.length > 1) ? plot.actualFormulas : null
    const totalMethods = multiMethods ? multiMethods.length : 1
    const activeMethod = multiMethods ? multiMethods[methodIdx] : null

    const displayCarbon = activeMethod?.carbon ? parseFloat(activeMethod.carbon) : (plot.carbon || 0)
    const displayAgb = activeMethod?.agb ? parseFloat(activeMethod.agb) : (plot.agb ? parseFloat(plot.agb) : null)
    const displayName = activeMethod?.name || method.name
    const displayFormula = activeMethod?.formula || method.formula
    const displayValue = displayCarbon * CARBON_PRICE

    const prevMethod = () => setMethodIdx(i => (i - 1 + totalMethods) % totalMethods)
    const nextMethod = () => setMethodIdx(i => (i + 1) % totalMethods)

    return (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{ background: '#1a2332', border: '1px solid rgba(16,185,129,0.25)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ background: 'rgba(16,185,129,0.12)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    <div>
                        <h2 className="text-white font-bold text-base">{plot.farmerName}</h2>
                        <p className="text-slate-400 text-xs mt-0.5">ID: {plot.id}</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10">
                        <XIco cls="w-4 h-4" />
                    </button>
                </div>

                {/* Method Navigator — only when multiple methods */}
                {multiMethods && (
                    <div className="px-5 py-3" style={{ background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
                        <div className="flex items-center justify-between">
                            <button onClick={prevMethod}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                title="วิธีก่อนหน้า">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                            </button>
                            <div className="flex-1 text-center">
                                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">วิธีคำนวณ</p>
                                <p className="text-white font-bold text-sm mt-0.5">{displayName}</p>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    {multiMethods.map((m, i) => (
                                        <button key={i} onClick={() => setMethodIdx(i)}
                                            className="transition-all duration-300"
                                            style={{
                                                width: i === methodIdx ? 20 : 8,
                                                height: 8,
                                                borderRadius: 4,
                                                background: i === methodIdx ? '#10b981' : 'rgba(255,255,255,0.15)',
                                                boxShadow: i === methodIdx ? '0 0 10px rgba(16,185,129,0.5)' : 'none',
                                            }}
                                            title={m.name} />
                                    ))}
                                </div>
                                <p className="text-slate-500 text-[9px] mt-1">{methodIdx + 1} / {totalMethods} วิธี</p>
                            </div>
                            <button onClick={nextMethod}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                title="วิธีถัดไป">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col gap-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'คาร์บอน', value: `${displayCarbon.toFixed(2)}`, unit: 'tCO₂e', color: '#10b981' },
                            { label: 'มวลชีวภาพ', value: displayAgb ? parseFloat(displayAgb).toFixed(2) : '—', unit: 'ตัน', color: '#34d399' },
                            { label: 'มูลค่า', value: `฿${displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: `@฿${CARBON_PRICE}/t`, color: '#10b981' },
                        ].map(({ label, value: v, unit, color }) => (
                            <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                <p className="font-black text-sm mt-1 method-value-transition" style={{ color }}>{v}</p>
                                <p className="text-slate-500 text-[9px] mt-0.5">{unit}</p>
                            </div>
                        ))}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'เนื้อที่', value: formatArea(plot.area) },
                            { label: 'พันธุ์ยาง', value: plot.variety || 'ไม่ระบุ' },
                            { label: 'อายุ (ระบุ)', value: plot.manualAge ? `${plot.manualAge} ปี` : '—' },
                            { label: 'อายุ (คำนวณ)', value: plot.age ? `${plot.age} ปี` : '—' },
                            { label: 'ปีที่ปลูก', value: `พ.ศ. ${plot.plantingYearBE || '—'}` },
                            { label: 'วิธีคำนวณ', value: displayName },
                        ].map(({ label, value: v }) => (
                            <div key={label} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{label}</p>
                                <p className="text-slate-200 text-xs font-semibold mt-0.5">{v}</p>
                            </div>
                        ))}
                    </div>

                    {/* Location */}
                    {(plot.subdistrict || plot.district || plot.province || plot.address) && (
                        <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <PinIco cls="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase">ที่ตั้ง</p>
                                <p className="text-slate-200 text-xs mt-0.5">
                                    {plot.subdistrict || plot.district || plot.province ?
                                        [plot.subdistrict && `ต.${plot.subdistrict}`, plot.district && `อ.${plot.district}`, plot.province && `จ.${plot.province}`].filter(Boolean).join(' ')
                                        : (plot.address || '-')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Coordinates */}
                    {(plot.lat || plot.lng) && (
                        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">พิกัด</p>
                            <p className="font-mono text-xs text-slate-300">{parseFloat(plot.lat || 0).toFixed(6)}, {parseFloat(plot.lng || 0).toFixed(6)}</p>
                        </div>
                    )}

                    {/* Calculation Details */}
                    <div className="rounded-xl px-4 py-3 flex flex-col gap-3" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <div className="flex items-center justify-between">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">ข้อมูลการคำนวณ</p>
                            {multiMethods && (
                                <span className="text-blue-400/80 text-[9px] px-2 py-0.5 rounded-full bg-blue-400/10 shrink-0 border border-blue-400/20">
                                    วิธีที่ {methodIdx + 1}/{totalMethods}
                                </span>
                            )}
                        </div>

                        {(() => {
                            const inNdvi = plot.actualFormulas ? plot.actualFormulas.some(f => (f.name || '').toLowerCase().includes('ndvi') || (f.formula || '').toLowerCase().includes('ndvi')) : (method.name || '').toLowerCase().includes('ndvi') || (method.formula || '').toLowerCase().includes('ndvi') || (plot.method || '').toLowerCase().includes('ndvi');
                            const inTcari = plot.actualFormulas ? plot.actualFormulas.some(f => (f.name || '').toLowerCase().includes('tcari') || (f.formula || '').toLowerCase().includes('tcari')) : (method.name || '').toLowerCase().includes('tcari') || (method.formula || '').toLowerCase().includes('tcari') || (plot.method || '').toLowerCase().includes('tcari');

                            const showNdvi = plot.ndvi && inNdvi;
                            const showTcari = plot.tcari && inTcari;

                            if (!plot.dbh && !plot.height && !showNdvi && !showTcari) return null;

                            return (
                                <div className="grid grid-cols-2 gap-2">
                                    {plot.dbh && (
                                        <div className="flex justify-between items-center rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.1)' }}>
                                            <span className="text-emerald-500/80 text-[10px] font-bold">DBH</span>
                                            <span className="text-emerald-400 text-xs font-mono">{plot.dbh} <span className="text-[9px] opacity-70">ซม.</span></span>
                                        </div>
                                    )}
                                    {plot.height && (
                                        <div className="flex justify-between items-center rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.1)' }}>
                                            <span className="text-emerald-500/80 text-[10px] font-bold">ความสูง</span>
                                            <span className="text-emerald-400 text-xs font-mono">{plot.height} <span className="text-[9px] opacity-70">ม.</span></span>
                                        </div>
                                    )}
                                    {showNdvi && (
                                        <div className="flex justify-between items-center rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.1)' }}>
                                            <span className="text-blue-400/80 text-[10px] font-bold">NDVI</span>
                                            <span className="text-blue-400 text-xs font-mono">{plot.ndvi}</span>
                                        </div>
                                    )}
                                    {showTcari && (
                                        <div className="flex justify-between items-center rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.1)' }}>
                                            <span className="text-purple-400/80 text-[10px] font-bold">TCARI</span>
                                            <span className="text-purple-400 text-xs font-mono">{plot.tcari}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Active method formula */}
                        <div className="flex flex-col gap-1.5 rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="text-slate-500 text-[10px] mb-0.5">สูตรที่ใช้คำนวณ:</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-slate-400 text-[9px] font-semibold">{displayName}</span>
                                <span className="text-blue-300 font-mono text-[10px] break-words leading-relaxed pl-1.5 border-l-2 border-blue-500/40">{displayFormula}</span>
                            </div>
                            {activeMethod?.carbon && (
                                <div className="flex items-center gap-2 mt-1 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span className="text-slate-500 text-[9px]">ผลลัพธ์วิธีนี้:</span>
                                    <span className="text-emerald-400 text-xs font-bold">{displayCarbon.toFixed(2)} tCO₂e</span>
                                    <span className="text-slate-600 text-[9px]">•</span>
                                    <span className="text-emerald-400/70 text-xs font-semibold">฿{displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => { onEdit(plot); onClose() }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                            <EditIco cls="w-4 h-4" /> แก้ไขแปลง
                        </button>
                        <button onClick={() => { onDelete(plot); onClose() }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                            <TrashIco cls="w-4 h-4" /> ลบแปลง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
// ─── DELETE ALL MODAL ────────────────────────────────────────────────────────
function DeleteAllModal({ count, onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl"
                style={{ background: '#fff', border: '2px solid #fecdd3' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <TrashIco cls="w-7 h-7 text-red-500" />
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-base" style={{ color: '#111827' }}>ลบแปลงทั้งหมด?</h3>
                    <p className="text-sm mt-1" style={{ color: '#6b7280' }}>จะลบ <span className="font-bold" style={{ color: '#ef4444' }}>{count} แปลง</span> ออกอย่างถาวร</p>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>ไม่สามารถกู้คืนได้</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-gray-50"
                        style={{ border: '1px solid #e5e7eb', color: '#374151' }}>ยกเลิก</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>ลบทั้งหมด</button>
                </div>
            </div>
        </div>
    )
}

// ─── PLOT CARD ITEM ───────────────────────────────────────────────
function PlotCardItem({ p, selectedPlot, zoomTo, handleEditPlot, setDeleteTarget, setDetailPlot }) {
    const [expanded, setExpanded] = useState(false)
    const [methodIdx, setMethodIdx] = useState(0)
    const method = getMethodInfo(p.method)
    const multiMethods = (p.actualFormulas && p.actualFormulas.length > 1) ? p.actualFormulas : null
    const totalMethods = multiMethods ? multiMethods.length : 1
    const activeMethod = multiMethods ? multiMethods[methodIdx] : null
    const displayCarbon = activeMethod?.carbon ? parseFloat(activeMethod.carbon) : (p.carbon || 0)
    const displayAgb = activeMethod?.agb ? parseFloat(activeMethod.agb) : (p.agb ? parseFloat(p.agb) : null)
    const displayName = activeMethod?.name || method.name
    const displayFormula = activeMethod?.formula || method.formula
    const displayValue = displayCarbon * CARBON_PRICE
    const prevMethod = (e) => { e.stopPropagation(); setMethodIdx(i => (i - 1 + totalMethods) % totalMethods) }
    const nextMethod = (e) => { e.stopPropagation(); setMethodIdx(i => (i + 1) % totalMethods) }
    const isActive = selectedPlot === p.id

    return (
        <div
            className={`plot-card rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isActive ? 'active-card' : ''}`}
            style={{
                background: isActive ? '#ecfdf5' : '#ffffff',
                border: isActive ? '2px solid #34d399' : '1px solid #d1fae5',
                boxShadow: isActive ? '0 8px 24px rgba(16,185,129,0.15), 0 0 0 4px rgba(16,185,129,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                margin: '2px 4px',
                flexShrink: 0
            }}
            onClick={() => zoomTo(p)}>

            {/* ═══ HEADER SECTION ═══ */}
            <div style={{ padding: '14px 14px 0 14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, fontFamily: "'Prompt', sans-serif" }}>{p.farmerName}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1, fontWeight: 500, fontFamily: "'Inter', monospace" }}>SKT-PLOT-{p.id}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="method-value-transition" style={{ fontSize: 20, fontWeight: 800, color: '#059669', lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{displayCarbon.toFixed(2)}</div>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, fontWeight: 700, letterSpacing: '0.06em' }}>tCO₂e</div>
                    </div>
                </div>
                {/* Area + badge row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap', fontFamily: "'Prompt', sans-serif" }}>{formatArea(p.area)}</span>
                    </div>
                    {multiMethods ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#ecfdf5', border: '1px solid #6ee7b7', flexShrink: 0 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap', fontFamily: "'Prompt', sans-serif" }}>{totalMethods} วิธี</span>
                        </div>
                    ) : (
                        <div style={{ padding: '4px 10px', borderRadius: 20, background: '#f1f5f9', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', display: 'block', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Prompt', sans-serif" }}>{displayName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ MULTI-METHOD TAB SECTION ═══ */}
            {multiMethods && (
                <div onClick={e => e.stopPropagation()} style={{ margin: '0 10px 10px 10px' }}>
                    {/* Tab strip */}
                    <div style={{ display: 'flex', borderRadius: '12px 12px 0 0', overflow: 'hidden', border: '1px solid #a7f3d0', borderBottom: 'none' }}>
                        {multiMethods.map((m, i) => (
                            <button key={i}
                                onClick={e => { e.stopPropagation(); setMethodIdx(i) }}
                                style={{
                                    flex: 1, padding: '7px 4px', fontSize: 9.5, fontWeight: 700,
                                    fontFamily: "'Prompt', sans-serif",
                                    background: i === methodIdx ? '#10b981' : (i % 2 === 0 ? '#f0fdf4' : '#ecfdf5'),
                                    color: i === methodIdx ? '#fff' : '#059669',
                                    border: 'none', borderRight: i < multiMethods.length - 1 ? '1px solid #a7f3d0' : 'none',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                {m.name || `วิธีที่ ${i + 1}`}
                            </button>
                        ))}
                    </div>
                    {/* Tab content */}
                    <div style={{ borderRadius: '0 0 12px 12px', border: '1px solid #a7f3d0', background: '#fff', padding: '10px 12px', boxShadow: '0 2px 8px rgba(16,185,129,0.06)' }}>
                        <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>สูตรคำนวณ</div>
                        <div style={{ fontSize: 11, color: '#059669', fontFamily: 'monospace', borderLeft: '3px solid #34d399', paddingLeft: 8, lineHeight: 1.5, wordBreak: 'break-all', fontWeight: 600, marginBottom: 8 }}>
                            {displayFormula || '—'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px dashed #d1fae5' }}>
                            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, fontFamily: "'Prompt', sans-serif" }}>ผลลัพธ์</span>
                            <span className="method-value-transition" style={{ fontSize: 13, fontWeight: 800, color: '#059669', fontFamily: "'Inter', sans-serif" }}>
                                {displayCarbon.toFixed(2)} <span style={{ fontSize: 10, color: '#34d399', fontWeight: 700 }}>tCO₂e</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ EXPANDED DETAILS ═══ */}
            {expanded && (
                <div onClick={e => e.stopPropagation()}
                    style={{ margin: '0 10px', paddingTop: 10, borderTop: '1px dashed #a7f3d0', marginBottom: 4 }}>
                    {[
                        { label: 'ที่ตั้ง', value: p.subdistrict || p.district || p.province ? [p.subdistrict && `ต.${p.subdistrict}`, p.district && `อ.${p.district}`, p.province && `จ.${p.province}`].filter(Boolean).join(' ') : (p.address || '-') },
                        { label: 'พิกัด', value: `${p.lat ? parseFloat(p.lat).toFixed(6) : '-'}, ${p.lng ? parseFloat(p.lng).toFixed(6) : '-'}`, mono: true },
                        { label: 'พันธุ์ยาง', value: p.variety || 'ไม่ระบุ' },
                        { label: 'อายุ (ระบุ)', value: p.manualAge ? `${p.manualAge} ปี` : '-' },
                        { label: 'อายุ (คำนวณ)', value: p.age ? `${p.age} ปี` : '-' },
                        { label: 'AGB', value: displayAgb ? `${parseFloat(displayAgb).toFixed(2)} ตัน` : '-', accent: true },
                    ].map(({ label, value, mono, accent }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                            <span style={{ fontSize: 10, color: '#6b7280', flexShrink: 0, fontFamily: "'Prompt', sans-serif" }}>{label}:</span>
                            <span style={{ fontSize: 10, color: accent ? '#059669' : '#374151', textAlign: 'right', fontFamily: mono ? 'monospace' : "'Prompt', sans-serif", fontWeight: accent ? 700 : 400, wordBreak: 'break-word' }}>{value}</span>
                        </div>
                    ))}
                    <div style={{ height: 8 }} />
                </div>
            )}

            {/* ═══ FOOTER ═══ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid #d1fae5', background: '#f8fffe' }}>
                <div>
                    <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', fontFamily: "'Inter', sans-serif" }}>มูลค่าประเมิน</div>
                    <div className="method-value-transition" style={{ fontSize: 15, fontWeight: 800, color: '#059669', marginTop: 1, fontFamily: "'Inter', sans-serif" }}>
                        ฿{displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
                        className="action-btn"
                        style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: expanded ? '#dcfce7' : '#f1f5f9', color: expanded ? '#15803d' : '#64748b', border: expanded ? '1px solid #86efac' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                        title={expanded ? 'ย่อ' : 'ขยาย'}>
                        <ChevIco cls={`w-3.5 h-3.5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleEditPlot(p) }}
                        className="action-btn"
                        style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="แก้ไข">
                        <EditIco cls="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget(p) }}
                        className="action-btn"
                        style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="ลบ">
                        <TrashIco cls="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PersonalDashboardPage() {
    const history = useHistory()
    const mapRef = useRef(null)
    const mapContainer = useRef(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [plots, setPlots] = useState([])
    const [stats, setStats] = useState({ plots: 0, area: 0, carbon: 0, value: 0 })
    const [userProfile, setUserProfile] = useState(null)
    const [search, setSearch] = useState('')
    const [showProfile, setShowProfile] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteAllTarget, setDeleteAllTarget] = useState(false)
    const [detailPlot, setDetailPlot] = useState(null)
    const [selectedPlot, setSelectedPlot] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeNav, setActiveNav] = useState('personal')

    // Load profile
    useEffect(() => {
        try {
            const p = localStorage.getItem('userProfile')
            if (p) setUserProfile(JSON.parse(p))
        } catch (_) { }
    }, [])

    // Fetch plots
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await getPlots()
                const all = Array.isArray(res) ? res : (res?.data || [])
                const mapped = all.map(p => {
                    let geometry = p.geometry
                    if (typeof geometry === 'string') try { geometry = JSON.parse(geometry) } catch (_) { }
                    if (!geometry && (p.lat || p.lng)) geometry = { type: 'Point', coordinates: [+p.lng, +p.lat] }

                    // Extract variety from notes
                    let variety = p.variety || 'RRIM 600'
                    if (p.notes?.includes('พันธุ์:')) {
                        variety = p.notes.split('พันธุ์:')[1]?.split('|')[0]?.trim() || variety
                    }

                    // Extract location
                    let subdistrict = p.subdistrict || p.tambon || ''
                    let district = p.district || p.amphoe || ''
                    let province = p.province || p.changwat || ''
                    let address = p.address || ''
                    if (p.notes) {
                        const locMatch = p.notes.match(/ที่ตั้ง:\s*ต\.([^อ]+)\s*อ\.([^จ]+)\s*จ\.(.+?)(\s*\||$)/)
                        if (locMatch) {
                            subdistrict = locMatch[1].trim();
                            district = locMatch[2].trim();
                            province = locMatch[3].trim();
                        } else {
                            const rawAddress = p.notes.match(/ที่ตั้ง:\s*([^|]+)/)
                            if (rawAddress) address = rawAddress[1].trim()
                        }
                    }

                    const age = p.tree_age ? parseInt(String(p.tree_age).replace(/\D/g, '')) || 0 : 0
                    let manualAge = p.manual_age || p.manualAge || null
                    if (p.notes && p.notes.includes('อายุ (ระบุเอง):')) {
                        manualAge = p.notes.match(/อายุ \(ระบุเอง\):\s*(\d+)/)?.[1] || manualAge
                    }

                    let agb = p.agb || p.above_ground_biomass || null
                    if (p.notes && p.notes.includes('AGB:')) {
                        agb = p.notes.match(/AGB:\s*([\d.]+)/)?.[1] || agb
                    }

                    let dbh = p.dbh || null;
                    if (!dbh && p.notes && p.notes.includes('DBH:')) dbh = p.notes.match(/DBH:\s*([\d.]+)/)?.[1] || dbh;

                    let height = p.height || null;
                    if (!height && p.notes && p.notes.includes('ความสูง:')) height = p.notes.match(/ความสูง:\s*([\d.]+)/)?.[1] || height;

                    let ndvi = p.satData?.ndvi || null;
                    if (!ndvi && p.notes && p.notes.includes('NDVI:')) ndvi = p.notes.match(/NDVI:\s*([\d.]+)/)?.[1] || ndvi;

                    let tcari = p.satData?.tcari || null;
                    if (!tcari && p.notes && p.notes.includes('TCARI:')) tcari = p.notes.match(/TCARI:\s*([\d.]+)/)?.[1] || tcari;

                    let actualFormulas = null;
                    if (p.notes && p.notes.includes('สูตร:')) {
                        const rawFormulas = p.notes.match(/สูตร:\s*([^|]+)/)?.[1]?.trim() || null;
                        if (rawFormulas) {
                            actualFormulas = rawFormulas.split(' ++ ').map(f => {
                                // Parse bracket metadata: name=formula[carbon:X,agb:Y]
                                const bracketMatch = f.match(/^(.+?)(?:\[([^\]]+)\])?$/);
                                const mainPart = bracketMatch ? bracketMatch[1] : f;
                                const metaPart = bracketMatch ? bracketMatch[2] : null;
                                const [name, ...formParts] = mainPart.split('=');
                                const entry = { name: name?.trim(), formula: formParts.join('=')?.trim() };
                                if (metaPart) {
                                    metaPart.split(',').forEach(pair => {
                                        const [k, v] = pair.split(':');
                                        if (k && v) entry[k.trim()] = parseFloat(v.trim());
                                    });
                                }
                                return entry;
                            }).filter(f => f.formula);
                            if (actualFormulas.length === 0) actualFormulas = null;
                        }
                    }

                    // Also try to use the raw methods array, which has per-method carbon
                    let methodsArr = p.methods || null;
                    if (methodsArr && Array.isArray(methodsArr) && methodsArr.length > 0) {
                        // If actualFormulas doesn't have carbon values, merge from methods
                        if (actualFormulas && actualFormulas.length > 0) {
                            actualFormulas = actualFormulas.map((af, i) => {
                                if (!af.carbon && methodsArr[i]) {
                                    af.carbon = parseFloat(methodsArr[i].carbon) || 0;
                                    af.agb = parseFloat(methodsArr[i].agb) || 0;
                                }
                                if (!af.formula && methodsArr[i]?.formula) {
                                    af.formula = methodsArr[i].formula;
                                }
                                return af;
                            });
                        } else if (!actualFormulas) {
                            // Build actualFormulas from methods array
                            actualFormulas = methodsArr.map(m => ({
                                name: m.name || getMethodInfo(m.method).name,
                                formula: m.formula || getMethodInfo(m.method).formula,
                                carbon: parseFloat(m.carbon) || 0,
                                agb: parseFloat(m.agb) || 0,
                            })).filter(f => f.formula);
                            if (actualFormulas.length === 0) actualFormulas = null;
                        }
                    }

                    // Get lat/lng from geometry
                    let lat = p.lat || null
                    let lng = p.lng || null
                    if (!lat && geometry?.type === 'Point') { lat = geometry.coordinates[1]; lng = geometry.coordinates[0] }
                    if (!lat && geometry?.type === 'Polygon') {
                        const coords = geometry.coordinates[0]
                        if (coords?.length) {
                            lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
                            lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
                        }
                    }

                    return {
                        ...p, geometry,
                        farmerName: p.name || p.farmer_name || 'ไม่ระบุชื่อ',
                        area: parseFloat(p.area_rai) || 0,
                        carbon: parseFloat(p.carbon_tons) || 0,
                        age, manualAge, agb, address, dbh, height, ndvi, tcari, actualFormulas,
                        plantingYearBE: p.planting_year ? parseInt(String(p.planting_year).replace(/\D/g, '')) + 543 : '—',
                        variety, subdistrict, district, province, lat, lng
                    }
                }).filter(p => p.geometry)

                setPlots(mapped)
                const totalArea = mapped.reduce((s, p) => s + p.area, 0)
                const totalCarbon = mapped.reduce((s, p) => s + p.carbon, 0)
                setStats({ plots: mapped.length, area: totalArea, carbon: totalCarbon, value: totalCarbon * CARBON_PRICE })
            } catch (e) { console.error(e); setPlots([]) }
            setLoading(false)
        }
        fetchData()
    }, [])

    // Init Map
    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return
        mapRef.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: { satellite: { type: 'raster', tiles: ['https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'], tileSize: 256 } },
                layers: [{ id: 'satellite', type: 'raster', source: 'satellite', minzoom: 0, maxzoom: 22 }]
            },
            center: [100.5, 13.75], zoom: 5, attributionControl: false
        })
        mapRef.current.on('load', () => setMapLoaded(true))
    }, [])

    // Add plots to map
    useEffect(() => {
        if (!mapRef.current || !mapLoaded || plots.length === 0) return
        const srcId = 'pd-plots'
        const geojson = {
            type: 'FeatureCollection',
            features: plots.map(p => ({ type: 'Feature', geometry: p.geometry, properties: { id: p.id, name: p.farmerName, carbon: p.carbon, area: p.area } }))
        }
        if (mapRef.current.getSource(srcId)) {
            mapRef.current.getSource(srcId).setData(geojson)
        } else {
            mapRef.current.addSource(srcId, { type: 'geojson', data: geojson })
            mapRef.current.addLayer({ id: 'pd-fill', type: 'fill', source: srcId, paint: { 'fill-color': '#10b981', 'fill-opacity': 0.45 } })
            mapRef.current.addLayer({ id: 'pd-line', type: 'line', source: srcId, paint: { 'line-color': '#6ee7b7', 'line-width': 2 } })
            mapRef.current.on('click', 'pd-fill', e => {
                const id = e.features[0]?.properties?.id
                const p = plots.find(x => x.id === id)
                if (p) setDetailPlot(p)
            })
            mapRef.current.on('mouseenter', 'pd-fill', () => { mapRef.current.getCanvas().style.cursor = 'pointer' })
            mapRef.current.on('mouseleave', 'pd-fill', () => { mapRef.current.getCanvas().style.cursor = '' })
            // Fit bounds
            const bounds = new maplibregl.LngLatBounds()
            plots.forEach(p => {
                if (p.geometry.type === 'Polygon') p.geometry.coordinates[0].forEach(c => bounds.extend(c))
                else if (p.geometry.type === 'Point') bounds.extend(p.geometry.coordinates)
            })
            if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, { padding: 40 })
        }
    }, [mapLoaded, plots])

    const zoomTo = (plot) => {
        if (!mapRef.current) return
        setSelectedPlot(plot.id)
        if (plot.geometry.type === 'Point') mapRef.current.flyTo({ center: plot.geometry.coordinates, zoom: 16 })
        else { const b = turf.bbox(plot.geometry); mapRef.current.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 60 }) }
    }

    const handleSaveProfile = (form) => {
        const updated = { ...userProfile, ...form }
        setUserProfile(updated)
        localStorage.setItem('userProfile', JSON.stringify(updated))
    }

    const handleDelete = async (plot) => {
        await deletePlot(plot.id)
        const next = plots.filter(p => p.id !== plot.id)
        setPlots(next)
        const totalCarbon = next.reduce((s, p) => s + p.carbon, 0)
        setStats({ plots: next.length, area: next.reduce((s, p) => s + p.area, 0), carbon: totalCarbon, value: totalCarbon * CARBON_PRICE })
        setDeleteTarget(null)
    }

    const handleDeleteAll = async () => {
        try {
            await Promise.all(plots.map(p => deletePlot(p.id)))
        } catch (e) { console.error(e) }
        setPlots([])
        setStats({ plots: 0, area: 0, carbon: 0, value: 0 })
        setDeleteAllTarget(false)
    }

    const handleEditPlot = (plot) => history.push(`/map?editPlotId=${plot.id}`)

    const filtered = plots.filter(p => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            p.farmerName?.toLowerCase().includes(q) ||
            p.province?.toLowerCase().includes(q) ||
            p.district?.toLowerCase().includes(q) ||
            p.subdistrict?.toLowerCase().includes(q) ||
            p.variety?.toLowerCase().includes(q) ||
            String(p.id).includes(q)
        )
    })

    const navItems = [
        { key: 'home', icon: <HomeIco />, label: 'หน้าหลัก', path: '/' },
        { key: 'map', icon: <MapIco />, label: 'แผนที่', path: '/map' },
        { key: 'personal', icon: <UserIco />, label: 'ส่วนตัว', path: '/dashboard/personal' },
        { key: 'dashboard', icon: <DashIco />, label: 'รวม', path: '/dashboard' },
        { key: 'history', icon: <HistIco />, label: 'ประวัติ', path: '/dashboard/history' },
    ]

    const avatarLetter = (userProfile?.name || '?')[0].toUpperCase()

    return (
        <div className="pd-root flex h-screen overflow-hidden" style={{ background: '#f8fffe', fontFamily: "'Prompt', 'Inter', sans-serif", color: '#1e293b' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .pd-root * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-in { animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .plot-card:hover { background: rgba(16,185,129,0.07) !important; }
        .plot-card.active-card { border-color: rgba(16,185,129,0.5) !important; background: rgba(16,185,129,0.06) !important; }
        .scrollbar::-webkit-scrollbar { width: 4px; }
        .scrollbar::-webkit-scrollbar-track { background: transparent; }
        .scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 99px; }
        .nav-btn:hover { background: rgba(16,185,129,0.12); color: #34d399; }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { filter: brightness(1.3); transform: scale(1.05); }
        .method-nav-btn { transition: all 0.2s; }
        .method-nav-btn:hover { transform: scale(1.15); }
        .method-badge-active { transition: all 0.3s ease; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          .pd-root { height: auto !important; min-height: 100dvh; overflow-y: auto !important; }
          .content-area { overflow: visible !important; padding-bottom: 70px; }
          .main-grid { flex-direction: column !important; flex: none !important; overflow: visible !important; padding-bottom: 0px !important; }
          .left-panel { max-height: none !important; width: 100% !important; flex: none !important; border-right: none !important; overflow: visible !important; }
          .plot-list-container { overflow: visible !important; }
          .map-panel { flex: none !important; height: 35vh !important; min-height: 250px; order: -1; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .stat-cards-container { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; margin-top: 8px; width: 100%; }
          .stat-card { width: 100% !important; padding: 12px 10px !important; }
          .stat-card-title { font-size: 8px !important; }
          .stat-card-value { font-size: 1.1rem !important; }
          .plot-card { padding: 14px 12px !important; gap: 4px; }
          .plot-card .pc-title { font-size: 0.95rem !important; margin-bottom: 2px; }
          .plot-card .pc-subtitle { font-size: 0.65rem !important; }
          .plot-card .pc-value { font-size: 1.1rem !important; }
          .plot-card .pc-badge { font-size: 0.6rem !important; padding: 2px 6px !important; }
          .plot-card .pc-label { font-size: 0.6rem !important; }
          .plot-card .pc-action { width: 32px !important; height: 32px !important; }
          .plot-card .pc-action svg { width: 14px !important; height: 14px !important; }
        }
      `}</style>

            {/* ── LEFT SIDEBAR NAV ── */}
            <aside className="desktop-nav flex-shrink-0 flex flex-col items-center py-6 gap-5" style={{ width: 64, background: '#ffffff', borderRight: '1px solid #e2f5ed', boxShadow: '2px 0 12px rgba(16,185,129,0.06)' }}>
                {/* Logo */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                    <LeafIco cls="w-5 h-5 text-white" />
                </div>
                {/* Nav items */}
                <div className="flex flex-col items-center gap-1 flex-1">
                    {navItems.map(item => (
                        <button key={item.key} onClick={() => history.push(item.path)} title={item.label}
                            className="nav-btn w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                            style={{ color: item.key === 'personal' ? '#059669' : '#94a3b8', background: item.key === 'personal' ? 'rgba(16,185,129,0.12)' : 'transparent' }}>
                            {item.icon}
                        </button>
                    ))}
                </div>
                {/* Logout */}
                <button onClick={() => { if (window.confirm('ออกจากระบบ?')) { localStorage.removeItem('userProfile'); history.push('/login') } }}
                    title="ออกจากระบบ"
                    className="nav-btn w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ color: '#64748b' }}>
                    <LogoutIco />
                </button>
            </aside>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col overflow-hidden content-area">

                {/* TOP BAR */}
                <header className="flex-shrink-0 flex items-center justify-between px-5 py-3" style={{ background: '#ffffff', borderBottom: '1px solid #e2f5ed', minHeight: 56, boxShadow: '0 2px 8px rgba(16,185,129,0.06)' }}>
                    <div>
                        <h1 className="font-black text-base leading-tight" style={{ color: '#064e3b' }}>แดชบอร์ดส่วนตัว</h1>
                        <p className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>ยินดีต้อนรับ, {userProfile?.name || 'ผู้ใช้งาน'}</p>
                    </div>

                    {/* Profile button */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowProfile(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                            style={{ border: '1px solid #d1fae5', background: '#f0fdf4' }}>
                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white' }}>
                                {userProfile?.picture ? <img src={userProfile.picture} alt="" className="w-full h-full object-cover" /> : avatarLetter}
                            </div>
                            <span className="text-xs font-semibold hidden sm:block" style={{ color: '#065f46' }}>{userProfile?.name || 'ผู้ใช้งาน'}</span>
                        </button>
                        <button onClick={() => setShowProfile(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                            <EditIco cls="w-3.5 h-3.5" /> แก้ไขโปรไฟล์
                        </button>
                    </div>
                </header>

                {/* PROFILE CARD */}
                <div className="flex-shrink-0 px-5 py-3" style={{ background: 'linear-gradient(135deg,#ecfdf5 0%,#f0fdf4 100%)', borderBottom: '1px solid #a7f3d0' }}>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-black text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white' }}>
                            {userProfile?.picture ? <img src={userProfile.picture} alt="" className="w-full h-full object-cover" /> : avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-sm" style={{ color: '#064e3b' }}>{userProfile?.name || 'ยังไม่ได้ตั้งชื่อ'}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {userProfile?.email && (
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <span className="text-slate-500">✉</span> {userProfile.email}
                                    </span>
                                )}
                                {userProfile?.phone && (
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <span className="text-slate-500">📱</span> {userProfile.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Summary badges */}
                        <div className="flex flex-wrap gap-3 stat-cards-container">
                            {[
                                { label: 'จำนวนแปลงทั้งหมด', value: `${stats.plots} แปลง`, color: '#10b981' },
                                { label: 'พื้นที่รวมทั้งหมด', value: `${stats.area.toFixed(1)} ไร่`, color: '#38bdf8' },
                                { label: 'ปริมาณคาร์บอนเครดิต', value: `${stats.carbon.toFixed(2)} tCO₂e`, color: '#10b981' },
                                { label: 'มูลค่าประเมินรวม', value: `฿${stats.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#10b981' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="rounded-xl px-4 py-2 stat-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider stat-card-title">{label}</p>
                                    <p className="font-black text-base mt-0.5 stat-card-value" style={{ color }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="flex-1 flex overflow-hidden main-grid">

                    {/* LEFT: Plot List */}
                    <div className="flex-shrink-0 flex flex-col overflow-hidden left-panel" style={{ width: 300, borderRight: '1px solid #d1fae5', background: '#f8fffe' }}>
                        {/* Panel header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #d1fae5', background: '#ffffff' }}>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm" style={{ color: '#064e3b', fontFamily: "'Prompt', sans-serif" }}>แปลงของฉัน</span>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ background: '#d1fae5', color: '#059669' }}>{filtered.length}</span>
                            </div>
                            {plots.length > 0 && (
                                <button
                                    onClick={() => setDeleteAllTarget(true)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-80 active:scale-95"
                                    style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', fontFamily: "'Prompt', sans-serif" }}>
                                    <TrashIco cls="w-3 h-3" />
                                    ลบทั้งหมด
                                </button>
                            )}
                        </div>
                        {/* Search */}
                        <div className="flex-shrink-0 px-4 py-2.5" style={{ borderBottom: '1px solid #e2f5ed', background: '#ffffff' }}>
                            <div className="relative">
                                <SearchIco cls="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาที่แปลง หรือ ID..."
                                    className="w-full pl-8 pr-7 py-2 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', color: '#1e293b' }} />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                                        <XIco cls="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Plot cards list */}
                        <div className="flex-1 overflow-y-auto scrollbar px-3 py-2 flex flex-col gap-2.5 plot-list-container" style={{ background: '#f0fdf4' }}>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                                    <div className="w-8 h-8 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
                                    <span className="text-xs">กำลังโหลด...</span>
                                </div>
                            ) : filtered.length > 0 ? (
                                filtered.map((p, i) => (
                                    <PlotCardItem key={p.id} p={p} selectedPlot={selectedPlot} zoomTo={zoomTo} handleEditPlot={handleEditPlot} setDeleteTarget={setDeleteTarget} setDetailPlot={setDetailPlot} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                                    <LeafIco cls="w-10 h-10" />
                                    <span className="text-xs">{search ? 'ไม่พบข้อมูล' : 'ยังไม่มีแปลง'}</span>
                                    {!search && (
                                        <button onClick={() => history.push('/map')} className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#10b981' }}>
                                            เพิ่มแปลงใหม่
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Map */}
                    <div className="flex-1 relative overflow-hidden map-panel">
                        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
                        {/* Map label */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(16,185,129,0.4)', backdropFilter: 'blur(8px)', color: '#064e3b' }}>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            แผนที่แสดงตำแหน่งแปลงของคุณ
                        </div>
                    </div>
                </div>

                {/* MOBILE BOTTOM NAV */}
                <nav className="mobile-nav hidden fixed bottom-0 left-0 right-0 z-[500] items-center justify-around py-3 px-4" style={{ background: '#ffffff', borderTop: '1px solid #d1fae5', boxShadow: '0 -2px 12px rgba(16,185,129,0.08)' }}>
                    {navItems.map(item => (
                        <button key={item.key} onClick={() => history.push(item.path)}
                            className="flex flex-col items-center gap-0.5 px-2"
                            style={{ color: item.key === 'personal' ? '#059669' : '#94a3b8' }}>
                            {item.icon}
                            <span className="text-[9px] font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── MODALS ── */}
            {showProfile && <ProfileModal profile={userProfile} onSave={handleSaveProfile} onClose={() => setShowProfile(false)} />}
            {deleteTarget && <DeleteModal plot={deleteTarget} onConfirm={() => handleDelete(deleteTarget)} onClose={() => setDeleteTarget(null)} />}
            {deleteAllTarget && <DeleteAllModal count={plots.length} onConfirm={handleDeleteAll} onClose={() => setDeleteAllTarget(false)} />}
            {detailPlot && <PlotDetailModal plot={detailPlot} onClose={() => setDetailPlot(null)} onEdit={handleEditPlot} onDelete={p => { setDeleteTarget(p); setDetailPlot(null) }} />}
        </div>
    )
}
