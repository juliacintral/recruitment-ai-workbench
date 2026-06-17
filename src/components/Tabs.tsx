type TabKey = 'jd' | 'interview' | 'outreach'

const TAB_LIST: { key: TabKey; label: string; icon: string }[] = [
  { key: 'jd', label: 'Job Description', icon: '📄' },
  { key: 'interview', label: 'Roteiro Técnico', icon: '🎯' },
  { key: 'outreach', label: 'LinkedIn Outreach', icon: '💬' }
]

export function Tabs({
  active,
  onChange
}: {
  active: TabKey
  onChange: (tab: TabKey) => void
}) {
  return (
    <nav className="tabs">
      {TAB_LIST.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
