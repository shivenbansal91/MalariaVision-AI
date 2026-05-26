import { Link } from 'react-router-dom'
import { Microscope, Code2, Share2, Link2, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#94a3b8',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
    }}>
      <div className="container-custom">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, #e53935, #b71c1c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Microscope size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>
                MalariaVision AI
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              AI-powered malaria detection using deep learning and blood cell microscopy imagery.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[Code2, Share2, Link2].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.2)'; e.currentTarget.style.color = '#e53935' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['Home', '/'], ['Detection', '/detection'], ['About Model', '/about'], ['Contact', '/contact']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} style={{
                    color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e53935'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Technology</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['TensorFlow / Keras', 'React + Vite', 'Flask REST API', 'Convolutional Neural Net', 'Deep Learning (CNN)'].map(item => (
                <li key={item} style={{ fontSize: '0.875rem' }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Disclaimer</h4>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.7 }}>
              This tool is for <strong style={{ color: '#fbbf24' }}>research & educational purposes only</strong>. 
              It is not a substitute for professional medical diagnosis. Always consult a licensed healthcare provider.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
        }}>
          <p>© {new Date().getFullYear()} MalariaVision AI. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built with <Heart size={12} style={{ color: '#e53935' }} /> for healthcare AI
          </p>
        </div>
      </div>
    </footer>
  )
}
