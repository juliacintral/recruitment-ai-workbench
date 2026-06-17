import { useState, useCallback } from 'react'
import type { Language } from '../types'
import { generateLinkedinOutreach } from '../lib/aiProvider'
import { outreachToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { OutputActions } from './OutputActions'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function OutreachPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [idioma, setIdioma] = useState<Language>('pt-BR')
  const [persona, setPersona] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [output, setOutput] = useState('')

  const effectiveBase = base.trim() || sharedBase

  const generate = useCallback(async () => {
    if (!effectiveBase) { setStatus('error'); setStatusMsg('Informe uma JD ou use a aba Job Description primeiro.'); return }
    setStatus('loading')
    setStatusMsg('Gerando abordagem LinkedIn...')
    setOutput('')
    try {
      const result = await generateLinkedinOutreach({ idioma, persona, jobDescription: effectiveBase })
      const text = outreachToPlainText(result)
      setOutput(text)
      setStatus('success')
      setStatusMsg('Abordagem gerada com sucesso.')
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err?.message || 'Erro ao gerar a abordagem.')
    }
  }, [effectiveBase, idioma, persona])

  return (
    <section className="panel">
      {sharedBase && !base && (
        <div className="shared-notice">✓ Usando JD gerada na aba anterior. Ou cole uma diferente abaixo.</div>
      )}
      <div className="grid">
        <label className="span-2">
          JD ou contexto da vaga
          <textarea value={base} onChange={(e) => setBase(e.target.value)} rows={8} placeholder="Cole a JD aqui ou deixe vazio para usar a JD gerada na aba anterior." />
        </label>
        <label>
          Idioma
          <select value={idioma} onChange={(e) => setIdioma(e.target.value as Language)}>
            <option value="pt-BR">Português</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Persona / tom
          <input value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="Ex.: Staff Engineer passivo, tom consultivo" />
        </label>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={generate} disabled={status === 'loading' || !effectiveBase}>
          {status === 'loading' ? 'Gerando...' : 'Gerar abordagem LinkedIn'}
        </button>
      </div>

      <StatusBadge status={status} message={statusMsg} />

      {output && (
        <>
          <OutputActions
            text={output}
            onCopy={async () => { await copyToClipboard(output); setStatusMsg('Copiado.'); setStatus('success') }}
          />
          <pre className="output">{output}</pre>
        </>
      )}
    </section>
  )
}
