import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Code2, ExternalLink, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields.')
      return
    }
    // Simulate send
    setSent(true)
    toast.success('Message sent! We\'ll get back to you soon.')
  }

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>

      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '3.5rem 0' }}>
        <div className="container-custom" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'white', marginBottom: '0.75rem' }}>
              Contact Us
            </h1>
            <p style={{ color: '#94a3b8', maxWidth: 460, margin: '0 auto' }}>
              Have questions about MalariaVision AI or want to collaborate? Reach out!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', maxWidth: 900, margin: '0 auto' }}>

          {/* Contact info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Get In Touch</h2>
              {[
                { icon: Mail,     label: 'Email',  val: 'team@malariavision.ai',   href: 'mailto:team@malariavision.ai' },
                { icon: Code2,    label: 'GitHub', val: 'github.com/malariavision', href: '#' },
                { icon: ExternalLink, label: 'Research', val: 'NIH Malaria Dataset', href: 'https://www.kaggle.com/iarunava/cell-images-for-detecting-malaria' },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', borderRadius: '0.65rem', marginBottom: '0.5rem', textDecoration: 'none', background: '#f8fafc', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(229,57,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={17} color="#e53935" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.label}</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{c.val}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: 1.7 }}>
                <strong>🔬 Research Collaboration:</strong> We welcome collaboration from medical researchers, data scientists, and healthcare institutions to improve malaria detection AI.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '2rem' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle size={32} color="#16a34a" />
                </div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Message Sent!</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}
                  className="btn-primary" style={{ marginTop: '1.5rem' }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Send a Message</h2>
                {[
                  { key: 'name',    label: 'Your Name',    type: 'text',  placeholder: 'John Doe' },
                  { key: 'email',   label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '0.7rem 1rem',
                        border: '1px solid #e2e8f0', borderRadius: '0.65rem',
                        fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#e53935'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Message</label>
                  <textarea
                    rows={5} placeholder="Your message..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.7rem 1rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.65rem',
                      fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif',
                      resize: 'vertical', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#e53935'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                  <Send size={17} /> Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`@media(max-width:768px){ .container-custom > div { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
