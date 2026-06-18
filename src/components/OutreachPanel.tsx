import { useState, useCallback } from 'react'
import { generateLinkedinOutreach } from '../lib/aiProvider'
import { outreachToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function OutreachPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [profileInfo, setProfileInfo] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [outputPT, setOutputPT] = useState('')
  const [outputEN, setOutputEN] = useState('')

  const effectiveBase = base.trim() || sharedBase

  const generate = useCallback(async () => {
    if (!effectiveBase) {
      setStatus('error')
      setStatusMsg('Informe uma JD ou use a aba Job Description primeiro.')
      return
    }
    setStatus('loading')
    setStatusMsg('Gerando abordagens PT e EN...')
    setOutputPT('')
    setOutputEN('')
    try {
      const result = await generateLinkedinOutreach({
        candidateName: candidateName.trim() || undefined,
        profileInfo: profileInfo.trim() || undefined,
        jobDescription: effectiveBase
      })
      setOutputPT(result.messagePT)
      setOutputEN(result.messageEN)
      setStatus('success')
      setStatusMsg('Abordagens geradas com sucesso.')
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err?.message || 'Erro ao gerar a abordagem.')
    }
  }, [effectiveBase, candidateName, profileInfo])

  const fullText = outreachToPlainText({ messagePT: outputPT, messageEN: outputEN })

  return (
    <section className="panel">
      {sharedBase && !base && (
        <div className="shared-notice">✓ Usando JD gerada na aba anterior. Ou cole uma diferente abaixo.</div>
      )}

      <div className="grid">
        <label className="span-2">
          JD ou contexto da vaga
          <textarea
            value={base}
            onChange={(e) => setBase(e.target.value)}
            rows={7}
            placeholder="Cole a JD aqui ou deixe vazio para usar a JD gerada na aba anterior."
          />
        </label>
        <label>
          Nome do candidato <span className="optional">(opcional)</span>
          <input
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Ex.: Ana Costa"
          />
        </label>
        <label>
          Informações do perfil <span className="optional">(opcional)</span>
          <input
            value={profileInfo}
            onChange={(e) => setProfileInfo(e.target.value)}
            placeholder="Ex.: 8 anos em AWS, liderou times em fintechs"
          />
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

      <StatusBadge status={status} message={statusMsg} />

      {outputPT && outputEN && (
        <div className="outreach-dual">
          <div className="outreach-block">
            <div className="outreach-lang-header pt">🇧🇷  Português do Brasil</div>
            <pre className="output">{outputPT}</pre>
            <button className="btn-copy-small" onClick={() => copyToClipboard(outputPT)}>Copiar PT</button>
          </div>
          <div className="outreach-block">
            <div className="outreach-lang-header en">🇺🇸  English</div>
            <pre className="output">{outputEN}</pre>
            <button className="btn-copy-small" onClick={() => copyToClipboard(outputEN)}>Copy EN</button>
          </div>
          <div className="actions" style={{ marginTop: '12px' }}>
            <button onClick={() => copyToClipboard(fullText)}>Copiar ambas</button>
          </div>
        </div>
      )}
    </section>
  )
}
