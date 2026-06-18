import { useState, useCallback } from 'react'
import type { JDSectioned, Language } from '../types'
import { generateJobDescription } from '../lib/aiProvider'
import { exportJDToDocx, brandName } from '../lib/docxExporter'
import { jdToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

type LangState = {
  status: Status
  msg: string
  jd: JDSectioned | null
  text: string
}

const initLang = (): LangState => ({ status: 'idle', msg: '', jd: null, text: '' })

export function JDPanel({ onJDGenerated }: { onJDGenerated: (text: string) => void }) {
  const [cargo, setCargo] = useState('')
  const [cliente, setCliente] = useState('')
  const [especificidades, setEspecificidades] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [pt, setPt] = useState<LangState>(initLang())
  const [en, setEn] = useState<LangState>(initLang())

  const generate = useCallback(async (idioma: Language) => {
    if (!cargo.trim() || !cliente.trim()) {
      const msg = 'Preencha pelo menos Cargo e Cliente.'
      if (idioma === 'pt-BR') setPt(s => ({ ...s, status: 'error', msg }))
      else setEn(s => ({ ...s, status: 'error', msg }))
      return
    }
    const brand = brandName(idioma)
    const set = idioma === 'pt-BR' ? setPt : setEn
    set({ status: 'loading', msg: 'Gerando...', jd: null, text: '' })
    try {
      const result = await generateJobDescription({ cargo, cliente, idioma, brand, especificidades, additionalContext })
      const text = jdToPlainText(result)
      set({ status: 'success', msg: 'Gerada com sucesso.', jd: result, text })
      onJDGenerated(text)
    } catch (err: any) {
      set({ status: 'error', msg: err?.message || 'Erro ao gerar.', jd: null, text: '' })
    }
  }, [cargo, cliente, especificidades, additionalContext, onJDGenerated])

  const hasAny = pt.text || en.text

  return (
    <section className="panel">
      <div className="grid">
        <label>
          Cargo
          <input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex.: Senior Data Engineer" />
        </label>
        <label>
          Cliente
          <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ex.: Acme Corp" />
        </label>
        <label className="span-2">
          Especificidades
          <textarea value={especificidades} onChange={e => setEspecificidades(e.target.value)} rows={4} placeholder="Stack, modelo de trabalho, diferenciais..." />
        </label>
        <label className="span-2">
          Contexto adicional
          <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} rows={4} placeholder="Senioridade, escopo, tipo de projeto..." />
        </label>
      </div>

      {/* Dois botões separados */}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => generate('pt-BR')} disabled={pt.status === 'loading'}>
          {pt.status === 'loading' ? 'Gerando PT...' : '🇧🇷 Gerar em Português'}
        </button>
        <button className="btn btn-secondary" onClick={() => generate('en')} disabled={en.status === 'loading'}>
          {en.status === 'loading' ? 'Generating EN...' : '🇺🇸 Generate in English'}
        </button>
      </div>

      {/* Outputs lado a lado quando ambos existem, empilhados quando só um */}
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
                <button className="btn btn-sm" onClick={() => exportJDToDocx(pt.jd!, cliente, 'pt-BR')}>Baixar .docx PT</button>
                <button className="btn btn-sm" onClick={() => { onJDGenerated(pt.text) }}>Usar nas outras abas</button>
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
                <button className="btn btn-sm" onClick={() => exportJDToDocx(en.jd!, cliente, 'en')}>Download .docx EN</button>
                <button className="btn btn-sm" onClick={() => { onJDGenerated(en.text) }}>Use in other tabs</button>
              </div>
              <pre className="output" style={{ margin: 0 }}>{en.text}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
