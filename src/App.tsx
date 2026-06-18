import { useState } from 'react'
import { Tabs } from './components/Tabs'
import { JDPanel } from './components/JDPanel'
import { InterviewPanel } from './components/InterviewPanel'
import { OutreachPanel } from './components/OutreachPanel'
import { ErrorBoundary } from './components/ErrorBoundary'

type TabKey = 'jd' | 'interview' | 'outreach'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('jd')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sharedBase, setSharedBase] = useState('')

  return (
    <div className={`app ${theme}`}>
      <aside className="sidebar">
        <div>
          <h1>Recruitment AI Workbench</h1>
          <p>JD, roteiro técnico e outreach estratégico — via Groq.</p>
        </div>
        <Tabs active={activeTab} onChange={setActiveTab} />
        <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 Modo escuro' : '☀️ Modo claro'}
        </button>
      </aside>

      <main className="content">
        <ErrorBoundary key={activeTab}>
          {activeTab === 'jd' && (
            <JDPanel onJDGenerated={setSharedBase} />
          )}
          {activeTab === 'interview' && (
            <InterviewPanel sharedBase={sharedBase} />
          )}
          {activeTab === 'outreach' && (
            <OutreachPanel sharedBase={sharedBase} />
          )}
        </ErrorBoundary>
      </main>
    </div>
  )
}
