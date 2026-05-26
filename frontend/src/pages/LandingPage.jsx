import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Brain, Zap, Shield, BarChart2,
  CheckCircle, ChevronRight, Microscope, Activity, Database
} from 'lucide-react'

/* ── Fade-up variant ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const stagger = { show: { transition: { staggerChildren: 0.12 } } }

const stats = [
  { value: '95.8%', label: 'Detection Accuracy' },
  { value: '< 2s',  label: 'Analysis Time' },
  { value: '27K+',  label: 'Training Images' },
  { value: '2',     label: 'Classification Classes' },
]

const features = [
  {
    icon: Brain, color: '#e53935',
    title: 'Deep Learning CNN',
    desc: 'Trained convolutional neural network distinguishes infected vs healthy blood cells with high precision.',
  },
  {
    icon: Zap, color: '#f59e0b',
    title: 'Instant Results',
    desc: 'Upload a microscopy image and receive a prediction with confidence score in under 2 seconds.',
  },
  {
    icon: Shield, color: '#16a34a',
    title: 'Medical Grade AI',
    desc: 'Built on the NIH Malaria Cell Images dataset — one of the most trusted sources for blood-cell imagery.',
  },
  {
    icon: BarChart2, color: '#1565c0',
    title: 'Confidence Scoring',
    desc: 'Every prediction comes with a probability confidence bar to support informed decision-making.',
  },
]

const steps = [
  { num: '01', title: 'Upload Image',      desc: 'Drag & drop or browse a blood cell microscopy image (JPG/PNG).' },
  { num: '02', title: 'AI Processing',     desc: 'Our CNN model preprocesses and analyzes the image layers.' },
  { num: '03', title: 'Instant Diagnosis', desc: 'Receive Parasitized / Uninfected result with confidence %.' },
]

export default function LandingPage() {
  return (
    <div style={{ paddingTop: '70px' }}>

      {/* ═══════════════════════════════
          HERO
      ═══════════════════════════════ */}
      <section className="gradient-hero" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,57,53,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: 340, height: 340, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21,101,192,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container-custom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', padding: '4rem 1.5rem' }}>

          {/* Left – text */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(229,57,53,0.08)', color: '#e53935',
                border: '1px solid rgba(229,57,53,0.2)',
                borderRadius: '99px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 600,
                marginBottom: '1.25rem',
              }}>
                <Activity size={13} /> AI-Powered Healthcare Diagnostics
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="section-title" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.15,
              color: '#0f172a', marginBottom: '1.25rem',
            }}>
              Detect{' '}
              <span style={{ background: 'linear-gradient(135deg,#e53935,#b71c1c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Malaria
              </span>{' '}
              with Deep Learning Precision
            </motion.h1>

            <motion.p variants={fadeUp} style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 480 }}>
              Upload a blood cell microscopy image and let our trained CNN model classify it as <strong>Parasitized</strong> or <strong>Uninfected</strong> — instantly and accurately.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/detection" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
                  Start Free Analysis <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/about" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
                  About the Model <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>

            {/* Checkmarks */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '2rem' }}>
              {['No sign-up required', 'Results in &lt; 2 seconds', 'Research-grade accuracy'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                  <CheckCircle size={15} color="#16a34a" />
                  <span dangerouslySetInnerHTML={{ __html: t }} />
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right – animated illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          >
            {/* Outer ring */}
            <div style={{
              width: 380, height: 380, borderRadius: '50%',
              border: '2px dashed rgba(229,57,53,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'spin-slow 30s linear infinite',
            }}>
              {/* Inner ring */}
              <div style={{
                width: 300, height: 300, borderRadius: '50%',
                border: '2px solid rgba(21,101,192,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 40px rgba(229,57,53,0.10)',
              }}>
                {/* Center icon */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#e53935,#b71c1c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    boxShadow: '0 12px 40px rgba(229,57,53,0.35)',
                    animation: 'float 3.5s ease-in-out infinite',
                  }}>
                    <Microscope size={52} color="white" />
                  </div>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    Blood Cell Analysis
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>CNN · TensorFlow · Keras</p>
                </div>
              </div>
            </div>

            {/* Orbit badges */}
            {[
              { label: 'Parasitized', color: '#dc2626', bg: '#fef2f2', top: '4%', left: '72%' },
              { label: 'Uninfected',  color: '#16a34a', bg: '#f0fdf4', top: '76%', left: '66%' },
              { label: '95.8% Acc',   color: '#1565c0', bg: '#eff6ff', top: '40%', left: '-4%' },
            ].map(b => (
              <motion.div key={b.label}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
                style={{
                  position: 'absolute', top: b.top, left: b.left,
                  background: b.bg, color: b.color,
                  border: `1px solid ${b.color}30`,
                  borderRadius: '99px', padding: '0.4rem 0.9rem',
                  fontSize: '0.78rem', fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  whiteSpace: 'nowrap',
                }}
              >
                {b.label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Responsive hero grid */}
        <style>{`
          @media (max-width:768px) {
            section > .container-custom { grid-template-columns: 1fr !important; text-align: center; }
            section > .container-custom > div:last-child { display: none !important; }
          }
        `}</style>
      </section>

      {/* ═══════════════════════════════
          STATS BANNER
      ═══════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg,#e53935,#b71c1c)', padding: '2.5rem 0' }}>
        <div className="container-custom" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <div style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: 'white', fontFamily: 'Outfit,sans-serif' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
        <style>{`@media(max-width:640px){ section > .container-custom { grid-template-columns: repeat(2,1fr) !important; } }`}</style>
      </section>

      {/* ═══════════════════════════════
          FEATURES
      ═══════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ display: 'inline-block', background: '#fef2f2', color: '#e53935', borderRadius: '99px', padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              KEY FEATURES
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#0f172a', marginBottom: '0.75rem' }}>
              Why MalariaVision AI?
            </h2>
            <p style={{ color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
              Powered by a deep learning CNN trained on 27,000+ labelled blood cell images from the NIH dataset.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <motion.div key={f.title}
                className="card"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: '2rem' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: `${f.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: '#f8fafc' }}>
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ display: 'inline-block', background: '#eff6ff', color: '#1565c0', borderRadius: '99px', padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              HOW IT WORKS
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#0f172a' }}>
              Three Simple Steps
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '2rem' }}>
            {steps.map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#e53935,#b71c1c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 6px 20px rgba(229,57,53,0.3)',
                }}>
                  <span style={{ color: 'white', fontWeight: 800, fontFamily: 'Outfit,sans-serif', fontSize: '1.1rem' }}>{s.num}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          CTA BANNER
      ═══════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,#0f172a,#1e293b)', textAlign: 'center' }}>
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(229,57,53,0.15)', color: '#f87171',
              border: '1px solid rgba(229,57,53,0.25)',
              borderRadius: '99px', padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 600,
              marginBottom: '1.5rem',
            }}>
              <Database size={13} /> Open for Research Use
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'white', marginBottom: '1rem' }}>
              Ready to Analyze Blood Samples?
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 520, margin: '0 auto 2rem', fontSize: '1rem' }}>
              Try the detection dashboard — no sign-up needed. Get AI-powered malaria diagnosis in seconds.
            </p>
            <Link to="/detection" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
                Open Detection Dashboard <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
