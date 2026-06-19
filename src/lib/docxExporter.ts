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

const PURPLE = '3B0077'
const SIZE_TITLE = 28   // half-points = 14pt
const SIZE_BODY  = 22   // half-points = 11pt

function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: SIZE_BODY, color: PURPLE })],
    spacing: { before: 300, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: PURPLE, space: 4 }
    }
  })
}

function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: SIZE_BODY, color: PURPLE })],
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
    children: [new TextRun({ text, size: SIZE_BODY })],
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

export async function exportJDToDocx(
  data: JDSectioned,
  clientName: string,
  idioma: Language
) {
  const logoBytes = await loadLogoBytes()
  const brand = brandName(idioma)
  const children: Paragraph[] = []

  // Logo — 180x140px
  children.push(
    new Paragraph({
      children: [
        new ImageRun({
          data: logoBytes,
          transformation: { width: 180, height: 140 },
          type: 'png'
        })
      ],
      spacing: { after: 400 }
    })
  )

  // Título — Calibri 14pt (SIZE_TITLE = 28 half-points)
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.title, bold: true, size: SIZE_TITLE, color: PURPLE, font: 'Calibri' })],
      spacing: { after: 320 }
    })
  )

  children.push(h2(`Location: ${data.location}`))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  children.push(h2('Role Overview'))
  for (const p of data.roleOverview.split(/\n{2,}/).filter(Boolean)) {
    children.push(para(p))
  }

  children.push(h2('Key Responsibilities'))
  for (const block of data.keyResponsibilities) {
    children.push(h3(block.theme))
    children.push(...bullets(block.items))
    children.push(new Paragraph({ spacing: { after: 40 } }))
  }

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

  children.push(h2('Required Qualifications'))
  children.push(...bullets(data.requiredQualifications))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  children.push(h2('Nice to Have'))
  children.push(...bullets(data.niceToHave))
  children.push(new Paragraph({ spacing: { after: 40 } }))

  children.push(h2('Project Context'))
  for (const p of data.projectContext.split(/\n{2,}/).filter(Boolean)) {
    children.push(para(p))
  }

  const footerLine = `${clientName} -- ${data.title} -- ${brand}`
  children.push(
    new Paragraph({
      children: [new TextRun({ text: footerLine, bold: true, size: SIZE_BODY, color: PURPLE })],
      spacing: { before: 400, after: 0 }
    })
  )

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: SIZE_BODY, color: '2E2E2E' } }
      }
    },
    sections: [{ children }]
  })

  const blob = await Packer.toBlob(doc)
  const filename = data.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') + '.docx'
  saveAs(blob, filename)
}
