import { useState, useCallback } from 'react'
import { generateLinkedinOutreach } from '../lib/aiProvider'
import { outreachToPlainText } from '../lib/formatters'

type Status = 'idle' | 'loading' | 'success' | 'error'

function CharCount({ text, limit }: { text: string; limit: number }) {
  const over = text.length > limit
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, marginLeft: '8px', color: over ? '#b42318' : '#667085' }}>
      {text.length}/{limit}{over ? ' ⚠️' : ''}
    </span>
  )
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text) } catch {}
}

// Renderiza texto com \n\n como parágrafos e linhas "- " como bullets
function MessageRenderer({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text)' }}>
      {blocks.map((block, i) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
        const allBullets = lines.every(l => l.startsWith('- '))
        if (allBullets) {
          return (
            <ul key={i} style={{ margin: '0 0 14px 0', paddingLeft: '20px' }}>
              {lines.map((l, j) => (
                <li key={j} style={{ marginBottom: '4px' }}>{l.replace(/^- /, '')}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} style={{ margin: '0 0 14px 0' }}>
            {lines.join(' ')}
          </p>
        )
      })}
    </div>
  )
}

export function OutreachPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [profileInfo, setProfileInfo] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [messagePT, setMessagePT] = useState('')
  const [messageEN, setMessageEN] = useState('')
  const [notePT, setNotePT] = useState('')
  const [noteEN, setNoteEN] = useState('')

  const effectiveBase = base.trim() || sharedBase
  const hasOutput = messagePT && messageEN

  const generate = useCallback(async () => {
    if (!effectiveBase) {
      setStatus('error')
      setStatusMsg('Informe uma JD ou gere uma na aba Job Description.')
      return
    }
    setStatus('loading')
    setStatusMsg('Gerando abordagens PT e EN...')
    setMessagePT(''); setMessageEN(''); setNotePT(''); setNoteEN('')
    try {
      const result = await generateLinkedinOutreach({
        candidateName: candidateName.trim() || undefined,
        profileInfo: profileInfo.trim() || undefined,
        jobDescription: effectiveBase
      })
      setMessagePT(result.messagePT)
      setMessageEN(result.messageEN)
      setNotePT(result.notePT)
      setNoteEN(result.noteEN)
      setStatus('success')
      setStatusMsg('Abordagens geradas com sucesso.')
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err?.message || 'Erro ao gerar abordagem.')
    }
  }, [effectiveBase, candidateName, profileInfo])

  return (
    <section className="panel">
      {sharedBase && !base.trim() && (
        <div className="shared-notice">✓ Usando JD gerada na aba anterior. Ou cole uma diferente abaixo.</div>
      )}

      <div className="grid">
        <label className="span-2">
          JD ou contexto da vaga
          <textarea
            value={base}
            onChange={e => setBase(e.target.value)}
            rows={7}
            placeholder="Cole a JD aqui ou deixe vazio para usar a JD gerada na aba anterior."
          />
        </label>
        <label>
          Nome do candidato
          <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}> (opcional)</span>
          <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Ex.: Ana Costa" />
        </label>
        <label>
          Informações do perfil
          <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}> (opcional)</span>
          <input value={profileInfo} onChange={e => setProfileInfo(e.target.value)} placeholder="Ex.: 8 anos em AWS, liderou times em fintechs" />
        </label>
      </div>

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={status === 'loading' || !effectiveBase}
        >
          {status === 'loading' ? 'Gerando...' : 'Gerar abordagem PT + EN'}
        </button>
      </div>

      {status !== 'idle' && (
        <div style={{ marginBottom: '16px' }}>
          <span className={`status status-${status}`}>{statusMsg}</span>
        </div>
      )}

      {hasOutput && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>

          {/* Mensagem PT */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1a7f3c', marginBottom: '14px' }}>
              🇧🇷 Português do Brasil
            </div>
            <MessageRenderer text={messagePT} />
            <button className="btn btn-sm" style={{ marginTop: '6px' }} onClick={() => copyText(messagePT)}>
              Copiar PT
            </button>
          </div>

          {/* Mensagem EN */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1a4fa0', marginBottom: '14px' }}>
              🇺🇸 English
            </div>
            <MessageRenderer text={messageEN} />
            <button className="btn btn-sm" style={{ marginTop: '6px' }} onClick={() => copyText(messageEN)}>
              Copy EN
            </button>
          </div>

          {/* Divisor */}
          {(notePT || noteEN) && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>
                <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} />
                Nota de Convite · Connection Note
                <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} />
              </div>

              {/* Nota PT */}
              <div style={{ border: '2px dashed var(--primary)', borderRadius: 'var(--radius)', background: 'var(--soft)', padding: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#1a7f3c', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  🇧🇷 Nota PT — convite de conexão
                  <CharCount text={notePT} limit={280} />
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.7, margin: '0 0 12px', color: 'var(--text)' }}>{notePT}</p>
                <button className="btn btn-sm" onClick={() => copyText(notePT)}>Copiar nota PT</button>
              </div>

              {/* Nota EN */}
              <div style={{ border: '2px dashed var(--primary)', borderRadius: 'var(--radius)', background: 'var(--soft)', padding: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#1a4fa0', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  🇺🇸 Note EN — connection invite
                  <CharCount text={noteEN} limit={280} />
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.7, margin: '0 0 12px', color: 'var(--text)' }}>{noteEN}</p>
                <button className="btn btn-sm" onClick={() => copyText(noteEN)}>Copy note EN</button>
              </div>
            </>
          )}

          {/* Copiar tudo */}
          <div className="actions" style={{ marginTop: '4px' }}>
            <button className="btn" onClick={() => copyText(outreachToPlainText({ messagePT, messageEN, notePT, noteEN }))}>
              Copiar tudo
            </button>
          </div>

        </div>
      )}
    </section>
  )
}
