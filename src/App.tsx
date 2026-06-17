import { useState, useCallback } from 'react'
import { Tabs } from './components/Tabs'
import { JDPanel } from './components/JDPanel'
import { InterviewPanel } from './components/InterviewPanel'
import { OutreachPanel } from './components/OutreachPanel'

type TabKey = 'jd' | 'interview' | 'outreach'

const TAB_META: Record<TabKey, { title: string; subtitle: string }> = {
  jd: {
    title: 'Job Description',
    subtitle: 'Gere uma JD pronta para mercado e exporte em .docx.'
  },
  interview: {
    title: 'Roteiro Técnico',
    subtitle: 'Roteiro de entrevista de 30 minutos com scorecard.'
  },
  outreach: {
    title: 'LinkedIn Outreach',
    subtitle: 'Abordagem estratégica e humana para candidatos passivos.'
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('jd')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sharedJD, setSharedJD] = useState('')

  const handleJDGenerated = useCallback((text: string) => {
    setSharedJD(text)
  }, [])

  return (
    <div className={`app ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🎛️</div>
          <h1>Recruitment AI<br />Workbench</h1>
          <p>IA para JD, entrevista técnica e outreach estratégico.</p>
        </div>

        <Tabs active={activeTab} onChange={setActiveTab} />

        <div className="sidebar-footer">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 Modo escuro' : '☀️ Modo claro'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSharedJD('')
              window.location.reload()
            }}
          >
            ✕ Limpar sessão
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h2>{TAB_META[activeTab].title}</h2>
            <p>{TAB_META[activeTab].subtitle}</p>
          </div>
          {sharedJD && activeTab !== 'jd' && (
            <div className="shared-pill">✓ JD pronta</div>
          )}
        </div>

        {activeTab === 'jd' && <JDPanel onJDGenerated={handleJDGenerated} />}
        {activeTab === 'interview' && <InterviewPanel sharedBase={sharedJD} />}
        {activeTab === 'outreach' && <OutreachPanel sharedBase={sharedJD} />}
      </main>
    </div>
  )
}
