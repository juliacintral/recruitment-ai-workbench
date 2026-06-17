import { useState, useCallback } from 'react'
import type { JDSectioned, Language } from '../types'
import { generateJobDescription } from '../lib/aiProvider'
import { exportJDToDocx } from '../lib/docxExporter'
import { jdToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { OutputActions } from './OutputActions'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function JDPanel({ onJDGenerated }: { onJDGenerated: (text: string) => void }) {
  const [cargo, setCargo] = useState('')
  const [cliente, setCliente] = useState('')
  const [idioma, setIdioma] = useState<Language>('pt-BR')
  const [brand, setBrand] = useState('Recruitment AI Workbench')
  const [especificidades, setEspecificidades] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [jd, setJd] = useState<JDSectioned | null>(null)
  const jdText = jd ? jdToPlainText(jd) : ''

  const generate = useCallback(async () => {
    if (!cargo.trim() || !cliente.trim()) {
      setStatus('error')
      setStatusMsg('Preencha pelo menos Cargo e Cliente.')
      return
    }
    setStatus('loading')
    setStatusMsg('Gerando Job Description...')
    setJd(null)
    try {
      const result = await generateJobDescription({ cargo, cliente, idioma, brand, especificidades, additionalContext })
      setJd(result)
      setStatus('success')
      setStatusMsg('Job Description gerada com sucesso.')
      onJDGenerated(jdToPlainText(result))
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err?.message || 'Erro ao gerar a Job Description.')
    }
  }, [cargo, cliente, idioma, brand, especificidades, additionalContext, onJDGenerated])

  return (
    <section className="panel">
      <div className="grid">
        <label>
          Cargo
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Senior Data Engineer" />
        </label>
        <label>
          Cliente
          <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ex.: Acme Corp" />
        </label>
        <label>
          Idioma
          <select value={idioma} onChange={(e) => setIdioma(e.target.value as Language)}>
            <option value="pt-BR">Português</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Marca / identificador final
          <input value={brand} onChange={(e) => setBrand(e.target.value)} />
        </label>
        <label className="span-2">
          Especificidades
          <textarea value={especificidades} onChange={(e) => setEspecificidades(e.target.value)} rows={4} placeholder="Stack, modelo de trabalho, diferenciais..." />
        </label>
        <label className="span-2">
          Contexto adicional
          <textarea value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} rows={4} placeholder="Senioridade, escopo, tipo de projeto, client context..." />
        </label>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={generate} disabled={status === 'loading'}>
          {status === 'loading' ? 'Gerando...' : 'Gerar Job Description'}
        </button>
      </div>

      <StatusBadge status={status} message={statusMsg} />

      {jdText && (
        <>
          <OutputActions
            text={jdText}
            onCopy={async () => { await copyToClipboard(jdText); setStatusMsg('Copiado.'); setStatus('success') }}
            onDownload={() => exportJDToDocx(jd!, cliente)}
            onSendToOthers={() => { onJDGenerated(jdText); setStatusMsg('JD enviada para as outras abas.'); setStatus('success') }}
          />
          <pre className="output">{jdText}</pre>
        </>
      )}
    </section>
  )
}
