type Props = {
  text: string
  onDownload?: () => void
  onSendToOthers?: () => void
  onCopy: () => void
}

export function OutputActions({ text, onDownload, onSendToOthers, onCopy }: Props) {
  return (
    <div className="actions">
      <button className="btn btn-ghost" disabled={!text} onClick={onCopy}>
        Copiar
      </button>
      {onDownload && (
        <button className="btn btn-ghost" disabled={!text} onClick={onDownload}>
          Baixar .docx
        </button>
      )}
      {onSendToOthers && (
        <button className="btn btn-ghost" disabled={!text} onClick={onSendToOthers}>
          Usar nas outras abas →
        </button>
      )}
    </div>
  )
}
