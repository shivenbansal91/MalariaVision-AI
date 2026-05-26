import { motion } from 'framer-motion'
import { Brain, Layers, Database, BarChart2, BookOpen, Activity, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const archLayers = [
  {
    name: 'Input Layer',
    detail: '128 × 128 × 3 RGB Image',
    color: '#6366f1',
    badge: 'Input',
  },
  {
    name: 'EfficientNetB0 Backbone',
    detail: 'Pretrained on ImageNet — 1,000-class weights, fine-tuned for blood cell classification',
    color: '#e53935',
    badge: 'Transfer Learning',
  },
  {
    name: 'Global Average Pooling',
    detail: 'Reduces spatial feature maps to a single vector — no Flatten needed',
    color: '#e53935',
    badge: 'Pooling',
  },
  {
    name: 'Batch Normalization',
    detail: 'Stabilises activations and accelerates convergence during fine-tuning',
    color: '#dc2626',
    badge: 'Normalisation',
  },
  {
    name: 'Dense Layer',
    detail: '256 units + ReLU activation — learns task-specific features',
    color: '#f59e0b',
    badge: 'FC',
  },
  {
    name: 'Dropout Layer',
    detail: 'Dropout(0.3) — regularisation to prevent overfitting',
    color: '#16a34a',
    badge: 'Regularise',
  },
  {
    name: 'Output Layer',
    detail: 'Dense(1) + Sigmoid → binary probability  [Parasitized | Uninfected]',
    color: '#1565c0',
    badge: 'Output',
  },
]

const metrics = [
  { label: 'Test Accuracy',   value: '95.8%', icon: BarChart2, color: '#16a34a' },
  { label: 'Precision',       value: '96.1%', icon: Activity,  color: '#1565c0' },
  { label: 'Recall',          value: '95.4%', icon: CheckCircle, color: '#e53935' },
  { label: 'F1 Score',        value: '95.7%', icon: Brain,     color: '#f59e0b' },
  { label: 'Training Images', value: '22,046', icon: Database, color: '#6366f1' },
  { label: 'Testing Images',  value: '5,512', icon: Layers,    color: '#0891b2' },
]

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '3.5rem 0' }}>
        <div className="container-custom" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(229,57,53,0.15)', color: '#f87171',
              border: '1px solid rgba(229,57,53,0.25)',
              borderRadius: '99px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 600,
              marginBottom: '1rem',
            }}>
              <BookOpen size={12} /> About the Model
            </span>
            <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'white', marginBottom: '0.75rem' }}>
              EfficientNetB0 Transfer Learning
            </h1>
            <p style={{ color: '#94a3b8', maxWidth: 560, margin: '0 auto' }}>
              Pretrained on ImageNet and fine-tuned for malaria parasite detection in microscopic blood smear images.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom" style={{ padding: '3rem 1.5rem' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {metrics.map(m => (
            <motion.div key={m.label} variants={fadeUp} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: 46, height: 46, borderRadius: '12px',
                background: `${m.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem',
              }}>
                <m.icon size={22} color={m.color} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit,sans-serif' }}>{m.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{m.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

          <motion.div className="card" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#e53935" /> Model Architecture
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
              EfficientNetB0 Transfer Learning — optimised for microscopic blood smear analysis
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {archLayers.map((l, i) => (
                <div key={l.name} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  {/* Number circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: `${l.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${l.color}40`,
                    fontSize: '0.72rem', fontWeight: 700, color: l.color,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{l.name}</p>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                        borderRadius: '99px', background: `${l.color}15`, color: l.color,
                        border: `1px solid ${l.color}30`, letterSpacing: '0.03em',
                      }}>{l.badge}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', lineHeight: 1.5 }}>{l.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Dataset */}
            <motion.div className="card" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ padding: '1.75rem' }}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} color="#1565c0" /> Dataset
              </h2>
              <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.8, marginBottom: '1rem' }}>
                Trained on the <strong>NIH Malaria Cell Images Dataset</strong> — 27,558 segmented blood cell images equally split between Parasitized and Uninfected classes.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[['Parasitized', '13,779', '#dc2626'], ['Uninfected', '13,779', '#16a34a']].map(([label, count, color]) => (
                  <div key={label} style={{ flex: 1, background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '0.65rem', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color, fontFamily: 'Outfit,sans-serif' }}>{count}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Training */}
            <motion.div className="card" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ padding: '1.75rem' }}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={18} color="#e53935" /> Training Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  ['Architecture',  'EfficientNetB0 Transfer Learning'],
                  ['Input Size',    '128 × 128 × 3 (RGB)'],
                  ['Optimizer',     'Adam'],
                  ['Loss Function', 'Binary Cross-Entropy'],
                  ['Epochs',        'Up to 28 with Early Stopping'],
                  ['Batch Size',    '16'],
                  ['Augmentation',  'Flip, Rotation, Zoom, Shear'],
                  ['Pretrained On', 'ImageNet (1,000 classes)'],
                  ['Framework',     'TensorFlow 2.x / Keras'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b', flexShrink: 0 }}>{k}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ background: 'linear-gradient(135deg,#e53935,#b71c1c)', borderRadius: '1.25rem', padding: '1.75rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Ready to test the model on real images?
              </p>
              <Link to="/detection" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'white', color: '#e53935', border: 'none',
                  borderRadius: '0.65rem', padding: '0.65rem 1.5rem',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  Try Detection <ArrowRight size={15} />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){ .container-custom > div { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
