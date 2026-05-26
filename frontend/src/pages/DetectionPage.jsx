import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Upload, X, Loader2, AlertTriangle, CheckCircle2,
  Microscope, Brain, Database, Layers, History,
  ChevronDown, ChevronUp, BarChart2, Trash2, ShieldX
} from 'lucide-react'
import { predictMalaria } from '../services/api'

/* ── Model info cards ── */
const modelCards = [
  { icon: Brain,    color: '#e53935', label: 'Architecture',  value: 'EfficientNetB0' },
  { icon: BarChart2,color: '#16a34a', label: 'Accuracy',      value: '95.8 %' },
  { icon: Database, color: '#1565c0', label: 'Dataset Size',  value: '27,558 images' },
  { icon: Layers,   color: '#f59e0b', label: 'Input Size',    value: '128 × 128 × 3' },
]

/* ── Confidence bar ── */
function ConfidenceBar({ value, color }) {
  return (
    <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
      <motion.div
        className="progress-fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  )
}

/* ── Single history item ── */
function HistoryItem({ item, onRemove }) {
  const infected = item.prediction === 'Parasitized'
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: infected ? '#fff5f5' : '#f0fdf4',
        borderRadius: '0.75rem',
        border: `1px solid ${infected ? '#fecaca' : '#bbf7d0'}`,
      }}
    >
      <img src={item.preview} alt="sample"
        style={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: infected ? '#dc2626' : '#16a34a' }}>
          {item.prediction}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
          {item.confidence.toFixed(1)}% confidence · {item.time}
        </p>
      </div>
      <button onClick={() => onRemove(item.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}

export default function DetectionPage() {
  const [file,            setFile]            = useState(null)
  const [preview,         setPreview]         = useState(null)
  const [dragging,        setDragging]        = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [result,          setResult]          = useState(null)
  const [validationError, setValidationError] = useState(null)  // image quality / confidence error
  const [history,         setHistory]         = useState([])
  const [showHistory,     setShowHistory]     = useState(true)
  const inputRef = useRef(null)

  /* ── File selection handler ── */
  const handleFile = useCallback((f) => {
    if (!f) return
    const allowed = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(f.type)) {
      toast.error('Please upload a JPG or PNG image.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max size is 10 MB.')
      return
    }
    setFile(f)
    setResult(null)
    setValidationError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }, [])

  /* ── Drag & drop ── */
  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }, [handleFile])

  /* ── Analyze ── */
  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload an image first.'); return }
    setLoading(true)
    setResult(null)
    setValidationError(null)
    try {
      const data = await predictMalaria(file)
      setResult(data)
      setValidationError(null)

      // Add to history
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setHistory(prev => [
        { id: Date.now(), prediction: data.prediction, confidence: data.confidence, preview, time: timeStr },
        ...prev.slice(0, 9),
      ])

      if (data.prediction === 'Parasitized') {
        toast.error('⚠️ Parasitized cells detected!')
      } else {
        toast.success('✅ Cells appear Uninfected!')
      }
    } catch (err) {
      console.error(err)
      const status = err.response?.status
      const msg    = err.response?.data?.error || 'Failed to reach the server. Is the backend running?'

      if (status === 422) {
        // Image quality / confidence validation error — show inline card
        setValidationError(msg)
        toast.error('🔬 Image validation failed')
      } else {
        // Network / server error — toast only
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Reset ── */
  const handleReset = () => {
    setFile(null); setPreview(null); setResult(null); setValidationError(null)
  }

  const infected = result?.prediction === 'Parasitized'

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '3rem 0 3.5rem' }}>
        <div className="container-custom" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(229,57,53,0.15)', color: '#f87171',
              border: '1px solid rgba(229,57,53,0.25)',
              borderRadius: '99px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 600,
              marginBottom: '1rem',
            }}>
              <Microscope size={12} /> Detection Dashboard
            </span>
            <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'white', marginBottom: '0.75rem' }}>
              Malaria Cell Analysis
            </h1>
            <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto', fontSize: '0.95rem' }}>
              Upload a blood-cell microscopy image to receive an AI-powered malaria diagnosis.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom" style={{ padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

          {/* ══ LEFT COLUMN ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Upload card */}
            <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '2rem' }}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="#e53935" /> Upload Blood Cell Image
              </h2>

              {/* Drop zone */}
              <div
                className={`drop-zone ${dragging ? 'active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !preview && inputRef.current?.click()}
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  cursor: preview ? 'default' : 'pointer',
                  position: 'relative',
                  minHeight: 240,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <input
                  ref={inputRef} type="file" accept="image/jpeg,image/png"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />

                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ width: '100%', position: 'relative' }}
                    >
                      <img src={preview} alt="Preview"
                        style={{ maxHeight: 280, maxWidth: '100%', borderRadius: '0.75rem', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                      <button onClick={(e) => { e.stopPropagation(); handleReset() }}
                        style={{
                          position: 'absolute', top: -10, right: -10,
                          background: '#dc2626', color: 'white', border: 'none',
                          borderRadius: '50%', width: 28, height: 28,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}>
                        <X size={14} />
                      </button>
                      <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {file?.name} · {(file?.size / 1024).toFixed(1)} KB
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(229,57,53,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                        border: '2px dashed rgba(229,57,53,0.25)',
                      }}>
                        <Upload size={28} color="#e53935" />
                      </div>
                      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                        Drag & drop or <span style={{ color: '#e53935' }}>browse</span>
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>JPG, PNG · Max 10 MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Analyze button */}
              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={!file || loading}
                style={{
                  width: '100%', justifyContent: 'center',
                  marginTop: '1.25rem', fontSize: '1rem', padding: '0.9rem',
                  opacity: (!file || loading) ? 0.65 : 1,
                  cursor: (!file || loading) ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> Analyzing Sample…</>
                ) : (
                  <><Microscope size={18} /> Analyze Sample</>
                )}
              </button>
            </motion.div>

            {/* ── Validation error card ── */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16 }}
                  style={{
                    background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
                    border: '1px solid #fed7aa',
                    borderLeft: '5px solid #f97316',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#ffedd5',
                    border: '2px solid #fed7aa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <ShieldX size={22} color="#ea580c" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                      🔬 Image Validation Failed
                    </p>
                    <p style={{ fontSize: '0.84rem', color: '#c2410c', lineHeight: 1.6 }}>
                      {validationError}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#ea580c', marginTop: '0.6rem', fontStyle: 'italic' }}>
                      Tip: Use a clear, focused microscopic blood smear image for accurate results.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result card */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24 }}
                  className={`card ${infected ? 'result-infected' : 'result-healthy'}`}
                  style={{ padding: '2rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: infected ? '#fee2e2' : '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {infected
                        ? <AlertTriangle size={26} color="#dc2626" />
                        : <CheckCircle2 size={26} color="#16a34a" />
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Prediction Result
                      </p>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: infected ? '#dc2626' : '#16a34a', fontFamily: 'Outfit,sans-serif' }}>
                        {result.prediction}
                      </h3>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Confidence Score</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: infected ? '#dc2626' : '#16a34a', fontFamily: 'Outfit,sans-serif' }}>
                        {result.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <ConfidenceBar value={result.confidence} color={infected ? '#dc2626' : '#16a34a'} />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                      {infected
                        ? '⚠️ Malaria parasites detected in blood cells. Please consult a healthcare professional.'
                        : '✅ No malaria parasites detected. Blood cells appear healthy.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History section */}
            {history.length > 0 && (
              <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem' }}>
                <button
                  onClick={() => setShowHistory(h => !h)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    marginBottom: showHistory ? '1rem' : 0,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                    <History size={18} color="#e53935" /> Recent Predictions ({history.length})
                  </span>
                  {showHistory ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </button>
                <AnimatePresence>
                  {showHistory && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 340, overflowY: 'auto' }}>
                      <AnimatePresence>
                        {history.map(item => (
                          <HistoryItem key={item.id} item={item}
                            onRemove={(id) => setHistory(h => h.filter(x => x.id !== id))} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Model info */}
            <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Brain size={17} color="#e53935" /> AI Model Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {modelCards.map(c => (
                  <div key={c.label} style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    background: '#f8fafc', borderRadius: '0.65rem', padding: '0.75rem',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '9px',
                      background: `${c.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <c.icon size={17} color={c.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.1rem' }}>{c.label}</p>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Usage tips */}
            <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              style={{ padding: '1.5rem', background: 'linear-gradient(135deg,#fff5f5,#fef2f2)', border: '1px solid #fecaca' }}>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem', fontSize: '0.95rem' }}>
                📋 Tips for Best Results
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  'Use clear, well-lit microscopy images',
                  'Ensure cells are in focus and centered',
                  'Avoid blurry or over-exposed images',
                  'JPG or PNG format, max 10 MB',
                  'Single blood cell images work best',
                ].map(tip => (
                  <li key={tip} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
                    <span style={{ color: '#e53935', flexShrink: 0, marginTop: '1px' }}>•</span> {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Disclaimer */}
            <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              style={{ padding: '1.25rem', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>
                <strong>⚠️ Disclaimer:</strong> This tool is for <strong>research & educational use only</strong>. Results are not a substitute for professional medical diagnosis.
              </p>
            </motion.div>

            {/* Processing indicator when loading */}
            <AnimatePresence>
              {loading && (
                <motion.div className="card"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ animation: 'spin-slow 1.2s linear infinite', display: 'inline-block', marginBottom: '0.75rem' }}>
                    <Loader2 size={32} color="#e53935" />
                  </div>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Processing…</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Running CNN inference on your image</p>
                  <div className="progress-bar" style={{ marginTop: '1rem' }}>
                    <div className="progress-fill shimmer" style={{ width: '75%', background: 'linear-gradient(90deg,#e53935,#f87171,#e53935)', backgroundSize: '200% 100%' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 900px) {
          .container-custom > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
