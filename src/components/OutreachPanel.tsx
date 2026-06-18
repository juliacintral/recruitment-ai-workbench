import { useState, useCallback } from 'react'
import { generateLinkedinOutreach } from '../lib/aiProvider'
import { outreachToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'

type Status = 'idle' | 'loading' | 'success' | 'error'

function CharCount({ text, limit }: { text: string; limit: number }) {
  const over = text.length > limit
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, marginLeft: '8px', color: over ? '#b42318' : '#667085' }}>
      {text.length}/{limit}{over ? ' ⚠️' : ''}
    </span>
  )
}

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
              {lines.map((l, j) => <li key={j} style={{ marginBottom: '4px' }}>{l.replace(/^- /, '')}</li>)}
            </ul>
          )
        }
        return <p key={i} style={{ margin: '0 0 14px 0' }}>{lines.join(' ')}</p>
      })}
    </div>
  )
}

type LangResult = { message: string; note: string }
type LangState = { status: Status; msg: string; result: LangResult | null }
const initLang = (): LangState => ({ status: 'idle', msg: '', result: null })

export function OutreachPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [profileInfo, setProfileInfo] = useState('')
  const [pt, setPt] = useState<LangState>(initLang())
  const [en, setEn] = useState<LangState>(initLang())

  const effectiveBase = base.trim() || sharedBase

  // Gera apenas o idioma clicado
  const generate = useCallback(async (lang: 'pt' | 'en') => {
    if (!effectiveBase) {
      const msg = 'Informe uma JD ou gere uma na aba Job Description.'
      if (lang === 'pt') setPt(s => ({ ...s, status: 'error', msg }))
      else setEn(s => ({ ...s, status: 'error', msg }))
      return
    }
    const set = lang === 'pt' ? setPt : setEn
    set({ status: 'loading', msg: 'Gerando...', result: null })
    try {
      const result = await generateLinkedinOutreach({
        candidateName: candidateName.trim() || undefined,
        profileInfo: profileInfo.trim() || undefined,
        jobDescription: effectiveBase
      })
      // Usa apenas os campos do idioma solicitado
      set({
        status: 'success',
        msg: 'Abordagem gerada.',
        result: lang === 'pt'
          ? { message: result.messagePT, note: result.notePT }
          : { message: result.messageEN, note: result.noteEN }
      })
    } catch (err: any) {
      set({ status: 'error', msg: err?.message || 'Erro ao gerar.', result: null })
    }
  }, [effectiveBase, candidateName, profileInfo])

  const hasPT = pt.result !== null
  const hasEN = en.result !== null
  const hasAny = hasPT || hasEN

  const allText = (hasPT && hasEN)
    ? outreachToPlainText({
        messagePT: pt.result!.message,
        messageEN: en.result!.message,
        notePT: pt.result!.note,
        noteEN: en.result!.note
      })
    : hasPT
      ? `MENSAGEM PT\n${pt.result!.message}\n\nNOTA PT\n${pt.result!.note}`
      : `MESSAGE EN\n${en.result!.message}\n\nNOTE EN\n${en.result!.note}`

  return (
    <section className="panel">
      {sharedBase && !base.trim() && (
        <div className="shared-notice">✓ Usando JD gerada na aba anterior. Ou cole uma diferente abaixo.</div>
      )}

      <div className="grid">
        <label className="span-2">
          JD ou contexto da vaga
          <textarea value={base} onChange={e => setBase(e.target.value)} rows={7}
            placeholder="Cole a JD aqui ou deixe vazio para usar a JD gerada na aba anterior." />
        </label>
        <label>
          Nome do candidato
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}> (opcional)</span>
          <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Ex.: Ana Costa" />
        </label>
        <label>
          Informações do perfil
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}> (opcional)</span>
          <input value={profileInfo} onChange={e => setProfileInfo(e.target.value)} placeholder="Ex.: 8 anos em AWS, liderou times em fintechs" />
        </label>
      </div>

      {/* Dois botões independentes */}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => generate('pt')} disabled={pt.status === 'loading' || !effectiveBase}>
          {pt.status === 'loading' ? 'Gerando PT...' : '🇧🇷 Gerar abordagem em Português'}
        </button>
        <button className="btn btn-secondary" onClick={() => generate('en')} disabled={en.status === 'loading' || !effectiveBase}>
          {en.status === 'loading' ? 'Generating EN...' : '🇺🇸 Generate approach in English'}
        </button>
      </div>

      {/* Status individual */}
      {pt.status !== 'idle' && pt.status !== 'success' && (
        <div style={{ marginBottom: '8px' }}>
          <span className={`status status-${pt.status}`}>{pt.msg}</span>
        </div>
      )}
      {en.status !== 'idle' && en.status !== 'success' && (
        <div style={{ marginBottom: '8px' }}>
          <span className={`status status-${en.status}`}>{en.msg}</span>
        </div>
      )}

      {/* Outputs */}
      {hasAny && (
        <div style={{ display: 'grid', gridTemplateColumns: hasPT && hasEN ? '1fr 1fr' : '1fr', gap: '16px', marginTop: '16px' }}>

          {hasPT && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1a7f3c' }}>
                🇧🇷 Português do Brasil
              </div>

              {/* Mensagem */}
              <MessageRenderer text={pt.result!.message} />
              <button className="btn btn-sm" onClick={() => copyToClipboard(pt.result!.message)}>Copiar mensagem PT</button>

              {/* Divisor nota */}
              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#1a7f3c', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  Nota de convite
                  <CharCount text={pt.result!.note} limit={280} />
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.7, margin: '0 0 10px', color: 'var(--text)' }}>{pt.result!.note}</p>
                <button className="btn btn-sm" onClick={() => copyToClipboard(pt.result!.note)}>Copiar nota PT</button>
              </div>
            </div>
          )}

          {hasEN && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1a4fa0' }}>
                🇺🇸 English
              </div>

              {/* Message */}
              <MessageRenderer text={en.result!.message} />
              <button className="btn btn-sm" onClick={() => copyToClipboard(en.result!.message)}>Copy message EN</button>

              {/* Note divider */}
              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#1a4fa0', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  Connection note
                  <CharCount text={en.result!.note} limit={280} />
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.7, margin: '0 0 10px', color: 'var(--text)' }}>{en.result!.note}</p>
                <button className="btn btn-sm" onClick={() => copyToClipboard(en.result!.note)}>Copy note EN</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copiar tudo (só aparece se tiver os dois) */}
      {hasPT && hasEN && (
        <div className="actions" style={{ marginTop: '12px' }}>
          <button className="btn" onClick={() => copyToClipboard(allText)}>Copiar tudo (PT + EN)</button>
        </div>
      )}
    </section>
  )
}
