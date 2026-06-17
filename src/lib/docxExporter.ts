import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType
} from 'docx'
import { saveAs } from 'file-saver'
import type { JDSectioned } from '../types'
import type { Language } from '../types'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fidelidade ao Modelo-JD: H2 bold + underline, espaçamento before 280 after 120 */
function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: '2E2E2E'
      })
    ],
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '3B0077', space: 4 }
    }
  })
}

/** H3 para subseções: Implementation & Development, Platform, Scope etc */
function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 22, color: '3B0077' })],
    spacing: { before: 160, after: 80 }
  })
}

/** Bullet fiel ao modelo: espaçamento after 80 */
function bullets(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 80 }
      })
  )
}

/** Parágrafo de texto corrido */
function para(text: string, spaceAfter = 120): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: spaceAfter }
  })
}

/** Tenta carregar a logo Insi do /public. Se falhar, retorna null. */
async function loadLogo(): Promise<Uint8Array | null> {
  try {
    const res = await fetch('/logo-insi.jpg')
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return new Uint8Array(buf)
  } catch {
    return null
  }
}

/** Regra de marca: PT-BR = Insi | EN = Insi North América */
export function brandName(idioma: Language): string {
  return idioma === 'pt-BR' ? 'Insi' : 'Insi North América'
}

// ─── Exportador principal ────────────────────────────────────────────────────

export async function exportJDToDocx(
  data: JDSectioned,
  clientName: string,
  idioma: Language
) {
  const logo = await loadLogo()
  const brand = brandName(idioma)
  const children: Paragraph[] = []

  // ── Logo ──
  if (logo) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logo,
            transformation: { width: 130, height: 44 },
            type: 'jpg'
          })
        ],
        spacing: { after: 360 }
      })
    )
  } else {
    // Fallback visual caso a imagem não carregue
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'insi  digital. simple. human.',
            bold: true,
            color: '3B0077',
            size: 26
          })
        ],
        spacing: { after: 360 }
      })
    )
  }

  // ── Título da vaga ── (bold, grande, fiel ao modelo)
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.title,
          bold: true,
          size: 40,
          color: '1A1A1A'
        })
      ],
      spacing: { after: 320 }
    })
  )

  // ── Location ──
  children.push(h2(`Location: ${data.location}`))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  // ── Role Overview ──
  children.push(h2('Role Overview'))
  // Pode ter múltiplos parágrafos (quebra por \n\n)
  for (const p of data.roleOverview.split(/\n{2,}/).filter(Boolean)) {
    children.push(para(p))
  }

  // ── Key Responsibilities ──
  children.push(h2('Key Responsibilities'))
  for (const block of data.keyResponsibilities) {
    children.push(h3(block.theme))
    children.push(...bullets(block.items))
    children.push(new Paragraph({ spacing: { after: 40 } }))
  }

  // ── Technical Environment ──
  children.push(h2('Technical Environment'))
  if (data.technicalEnvironment.platform?.length) {
    children.push(h3('Platform'))
    children.push(...bullets(data.technicalEnvironment.platform))
    children.push(new Paragraph({ spacing: { after: 40 } }))
  }
  if (data.technicalEnvironment.scope?.length) {
    children.push(h3('Scope'))
    children.push(...bullets(data.technicalEnvironment.scope))
    children.push(new Paragraph({ spacing: { after: 40 } }))
  }
  for (const section of data.technicalEnvironment.additional || []) {
    children.push(h3(section.label))
    children.push(...bullets(section.items))
    children.push(new Paragraph({ spacing: { after: 40 } }))
  }

  // ── Required Qualifications ──
  children.push(h2('Required Qualifications'))
  children.push(...bullets(data.requiredQualifications))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  // ── Nice to Have ──
  children.push(h2('Nice to Have'))
  children.push(...bullets(data.niceToHave))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  // ── Project Context ──
  children.push(h2('Project Context'))
  for (const p of data.projectContext.split(/\n{2,}/).filter(Boolean)) {
    children.push(para(p))
  }

  // ── Linha final (fiel ao modelo: bold, ex: Raymond James -- ServiceNow FSO Specialist -- Insi North America) ──
  const footerLine = `${clientName} -- ${data.title} -- ${brand}`
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: footerLine,
          bold: true,
          size: 20,
          color: '1A1A1A'
        })
      ],
      spacing: { before: 400, after: 0 }
    })
  )

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '2E2E2E' }
        }
      }
    },
    sections: [{ children }]
  })

  const blob = await Packer.toBlob(doc)
  const filename =
    data.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') + '.docx'
  saveAs(blob, filename)
}
