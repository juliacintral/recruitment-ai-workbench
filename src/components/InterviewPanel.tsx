import { useState, useCallback } from 'react'
import type { Language } from '../types'
import { generateInterviewGuide } from '../lib/aiProvider'
import { interviewToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

type LangState = { status: Status; msg: string; text: string }
const initLang = (): LangState => ({ status: 'idle', msg: '', text: '' })

export function InterviewPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [foco, setFoco] = useState('')
  const [pt, setPt] = useState<LangState>(initLang())
  const [en, setEn] = useState<LangState>(initLang())

  const effectiveBase = base.trim() || sharedBase

  const generate = useCallback(async (idioma: Language) => {
    if (!effectiveBase) {
      const msg = 'Informe uma JD ou use a aba Job Description primeiro.'
      if (idioma === 'pt-BR') setPt(s => ({ ...s, status: 'error', msg }))
      else setEn(s => ({ ...s, status: 'error', msg }))
      return
    }
    const set = idioma === 'pt-BR' ? setPt : setEn
    set({ status: 'loading', msg: 'Gerando roteiro...', text: '' })
    try {
      const result = await generateInterviewGuide({ idioma, foco, jobDescription: effectiveBase })
      const text = interviewToPlainText(result)
      set({ status: 'success', msg: 'Roteiro gerado.', text })
    } catch (err: any) {
      set({ status: 'error', msg: err?.message || 'Erro ao gerar o roteiro.', text: '' })
    }
  }, [effectiveBase, foco])

  const hasAny = pt.text || en.text

  return (
    <section className="panel">
      {sharedBase && !base && (
        <div className="shared-notice">✓ Usando JD gerada na aba anterior. Ou cole uma diferente abaixo.</div>
      )}

      <div className="grid">
        <label className="span-2">
          JD ou contexto da vaga
          <textarea value={base} onChange={e => setBase(e.target.value)} rows={8} placeholder="Cole a JD aqui ou deixe vazio para usar a JD gerada na aba anterior." />
        </label>
        <label className="span-2">
          Foco adicional
          <input value={foco} onChange={e => setFoco(e.target.value)} placeholder="Ex.: system design, troubleshooting, liderança técnica" />
        </label>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => generate('pt-BR')} disabled={pt.status === 'loading' || !effectiveBase}>
          {pt.status === 'loading' ? 'Gerando PT...' : '🇧🇷 Gerar roteiro em Português'}
        </button>
        <button className="btn btn-secondary" onClick={() => generate('en')} disabled={en.status === 'loading' || !effectiveBase}>
          {en.status === 'loading' ? 'Generating EN...' : '🇺🇸 Generate guide in English'}
        </button>
      </div>

      {hasAny && (
        <div style={{ display: 'grid', gridTemplateColumns: pt.text && en.text ? '1fr 1fr' : '1fr', gap: '16px', marginTop: '16px' }}>

          {pt.text && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1a7f3c' }}>
                🇧🇷 Português
              </div>
              <StatusBadge status={pt.status} message={pt.msg} />
              <div className="actions" style={{ margin: 0 }}>
                <button className="btn btn-sm" onClick={() => copyToClipboard(pt.text)}>Copiar PT</button>
              </div>
              <pre className="output" style={{ margin: 0 }}>{pt.text}</pre>
            </div>
          )}

          {en.text && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1a4fa0' }}>
                🇺🇸 English
              </div>
              <StatusBadge status={en.status} message={en.msg} />
              <div className="actions" style={{ margin: 0 }}>
                <button className="btn btn-sm" onClick={() => copyToClipboard(en.text)}>Copy EN</button>
              </div>
              <pre className="output" style={{ margin: 0 }}>{en.text}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
