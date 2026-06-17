import { useState, useCallback } from 'react'
import type { Language } from '../types'
import { generateInterviewGuide } from '../lib/aiProvider'
import { interviewToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { OutputActions } from './OutputActions'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function InterviewPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [idioma, setIdioma] = useState<Language>('pt-BR')
  const [foco, setFoco] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [output, setOutput] = useState('')

  const effectiveBase = base.trim() || sharedBase

  const generate = useCallback(async () => {
    if (!effectiveBase) { setStatus('error'); setStatusMsg('Informe uma JD ou use a aba Job Description primeiro.'); return }
    setStatus('loading')
    setStatusMsg('Gerando roteiro técnico...')
    setOutput('')
    try {
      const result = await generateInterviewGuide({ idioma, foco, jobDescription: effectiveBase })
      const text = interviewToPlainText(result)
      setOutput(text)
      setStatus('success')
      setStatusMsg('Roteiro gerado com sucesso.')
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err?.message || 'Erro ao gerar o roteiro.')
    }
  }, [effectiveBase, idioma, foco])

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
          Foco adicional
          <input value={foco} onChange={(e) => setFoco(e.target.value)} placeholder="Ex.: system design, troubleshooting, liderança técnica" />
        </label>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={generate} disabled={status === 'loading' || !effectiveBase}>
          {status === 'loading' ? 'Gerando...' : 'Gerar roteiro'}
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
