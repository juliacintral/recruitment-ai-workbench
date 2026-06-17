export async function copyToClipboard(text: string): Promise<void> {
  if (!text) throw new Error('Sem conteúdo para copiar')
  await navigator.clipboard.writeText(text)
}
