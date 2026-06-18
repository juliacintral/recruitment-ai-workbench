import { useState, useCallback } from 'react'
import { generateLinkedinOutreach } from '../lib/aiProvider'
import { outreachToPlainText } from '../lib/formatters'
import { copyToClipboard } from '../lib/clipboard'
import { StatusBadge } from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

function CharCount({ text, limit }: { text: string; limit: number }) {
  const count = text.length
  const over = count > limit
  return (
    <span style={{ fontSize: '11px', color: over ? '#b42318' : '#667085', marginLeft: '8px' }}>
      {count}/{limit}{over ? ' ⚠️' : ''}
    </span>
  )
}

export function OutreachPanel({ sharedBase }: { sharedBase: string }) {
  const [base, setBase] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [profileInfo, setProfileInfo] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [outputPT, setOutputPT] = useState('')
  const [outputEN, setOutputEN] = useState('')
  const [notePT, setNotePT] = useState('')
  const [noteEN, setNoteEN] = useState('')

  const effectiveBase = base.trim() || sharedBase

  const generate = useCallback(async () => {
    if (!effectiveBase) {
      setStatus('error')
      setStatusMsg('Informe uma JD ou use a aba Job Description primeiro.')
      return
    }
    setStatus('loading')
    setStatusMsg('Gerando abordagens PT e EN...')
    setOutputPT(''); setOutputEN(''); setNotePT(''); setNoteEN('')
    try {
      const result = await generateLinkedinOutreach({
        candidateName: candidateName.trim() || undefined,
        profileInfo: profileInfo.trim() || undefined,
        jobDescription: effectiveBase
      })
      setOutputPT(result.messagePT)
      setOutputEN(result.messageEN)
      setNotePT(result.notePT)
      setNoteEN(result.noteEN)
      setStatus('success')
      setStatusMsg('Abordagens geradas com sucesso.')
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err?.message || 'Erro ao gerar a abordagem.')
    }
  }, [effectiveBase, candidateName, profileInfo])

  const fullText = outreachToPlainText({ messagePT: outputPT, messageEN: outputEN, notePT, noteEN })
  const hasOutput = outputPT && outputEN

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

      {hasOutput && (
        <div className="outreach-dual">

          {/* Mensagens principais */}
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

          {/* Notas de convite */}
          {(notePT || noteEN) && (
            <>
              <div className="outreach-section-divider">Nota de Convite — LinkedIn Connection Note</div>

              <div className="outreach-block note-block">
                <div className="outreach-lang-header pt">
                  🇧🇷  Nota PT
                  <CharCount text={notePT} limit={280} />
                </div>
                <pre className="output note-output">{notePT}</pre>
                <button className="btn-copy-small" onClick={() => copyToClipboard(notePT)}>Copiar nota PT</button>
              </div>

              <div className="outreach-block note-block">
                <div className="outreach-lang-header en">
                  🇺🇸  Note EN
                  <CharCount text={noteEN} limit={280} />
                </div>
                <pre className="output note-output">{noteEN}</pre>
                <button className="btn-copy-small" onClick={() => copyToClipboard(noteEN)}>Copy note EN</button>
              </div>
            </>
          )}

          <div className="actions" style={{ marginTop: '12px' }}>
            <button onClick={() => copyToClipboard(fullText)}>Copiar tudo</button>
          </div>
        </div>
      )}
    </section>
  )
}
