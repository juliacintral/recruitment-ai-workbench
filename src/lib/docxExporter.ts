import {
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun
} from 'docx'
import { saveAs } from 'file-saver'
import type { JDSectioned, Language } from '../types'
import logoUrl from '../../public/Logo_Insi_logo_Positivo_Color_SemFundo (1).png'

// Cor roxo escuro Insi — aplicada em todos os títulos e subtítulos
const PURPLE = '3B0077'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** H2: seções principais — roxo escuro, bold, borda inferior roxa */
function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, color: PURPLE })],
    spacing: { before: 300, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: PURPLE, space: 4 }
    }
  })
}

/** H3: subseções (Platform, Scope, Implementation & Development etc.) */
function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, color: PURPLE })],
    spacing: { before: 180, after: 80 }
  })
}

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

function para(text: string, spaceAfter = 120): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: spaceAfter }
  })
}

async function loadLogoBytes(): Promise<Uint8Array> {
  const res = await fetch(logoUrl)
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

export function brandName(idioma: Language): string {
  return idioma === 'pt-BR' ? 'Insi' : 'Insi North América'
}

// ─── Exportador principal ─────────────────────────────────────────────────────

export async function exportJDToDocx(
  data: JDSectioned,
  clientName: string,
  idioma: Language
) {
  const logoBytes = await loadLogoBytes()
  const brand = brandName(idioma)
  const children: Paragraph[] = []

  // ── Logo Insi — 220x74 para boa visualização ──
  children.push(
    new Paragraph({
      children: [
        new ImageRun({
          data: logoBytes,
          transformation: { width: 220, height: 74 },
          type: 'png'
        })
      ],
      spacing: { after: 400 }
    })
  )

  // ── Título da vaga — roxo escuro, bold ──
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.title, bold: true, size: 44, color: PURPLE })],
      spacing: { after: 320 }
    })
  )

  // ── Location ──
  children.push(h2(`Location: ${data.location}`))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  // ── Role Overview ──
  children.push(h2('Role Overview'))
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

  // ── Linha final — roxo escuro ──
  const footerLine = `${clientName} -- ${data.title} -- ${brand}`
  children.push(
    new Paragraph({
      children: [new TextRun({ text: footerLine, bold: true, size: 20, color: PURPLE })],
      spacing: { before: 400, after: 0 }
    })
  )

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: '2E2E2E' } }
      }
    },
    sections: [{ children }]
  })

  const blob = await Packer.toBlob(doc)
  const filename = data.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') + '.docx'
  saveAs(blob, filename)
}
