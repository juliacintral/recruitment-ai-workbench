import { useState } from 'react'
import { JDPanel } from './components/JDPanel'
import { InterviewPanel } from './components/InterviewPanel'
import { OutreachPanel } from './components/OutreachPanel'
import { ErrorBoundary } from './components/ErrorBoundary'

type TabKey = 'jd' | 'interview' | 'outreach'

const TABS: { key: TabKey; icon: string; label: string; desc: string }[] = [
  { key: 'jd',        icon: '📄', label: 'Job Description', desc: 'Gera JD completa + .docx' },
  { key: 'interview', icon: '🎯', label: 'Roteiro Técnico',   desc: 'Entrevista de 30 min' },
  { key: 'outreach',  icon: '💬', label: 'LinkedIn Outreach', desc: 'Abordagem estratégica' },
]

export default function App() {
  const [activeTab, setActiveTab]   = useState<TabKey>('jd')
  const [theme, setTheme]           = useState<'light' | 'dark'>('light')
  const [sharedBase, setSharedBase] = useState('')

  const current = TABS.find(t => t.key === activeTab)!

  return (
    <div className={`app ${theme}`}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-wordmark">
            <div className="brand-icon">✨</div>
            <h1>Recruitment AI<br />Workbench</h1>
          </div>
          <p>Ferramenta de IA para recrutamento consultivo e técnico.</p>
        </div>

        <div>
          <div className="nav-label">Módulos</div>
          <nav className="tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙' : '☀️'}
            {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          </button>
          <p className="by-credit">by <strong>Júlia Cintra</strong></p>
        </div>

      </aside>

      {/* ── MAIN ── */}
      <main className="main">

        <div className="topbar">
          <div className="topbar-text">
            <h2>{current.icon} {current.label}</h2>
            <p>{current.desc}</p>
          </div>
          {sharedBase && activeTab !== 'jd' && (
            <span className="shared-pill">✓ JD carregada</span>
          )}
        </div>

        <ErrorBoundary key={activeTab}>
          {activeTab === 'jd'        && <JDPanel        onJDGenerated={setSharedBase} />}
          {activeTab === 'interview' && <InterviewPanel  sharedBase={sharedBase} />}
          {activeTab === 'outreach'  && <OutreachPanel   sharedBase={sharedBase} />}
        </ErrorBoundary>

      </main>
    </div>
  )
}
