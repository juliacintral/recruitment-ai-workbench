import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from 'docx'
import { saveAs } from 'file-saver'
import type { JDSectioned } from '../types'

function addHeading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true })],
    spacing: { before: 200, after: 100 }
  })
}

function addBullets(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 60 }
      })
  )
}

export async function exportJDToDocx(data: JDSectioned, clientName: string) {
  const children: Paragraph[] = []

  // Logo placeholder
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '[ LOGO ]', bold: true, size: 20 })],
      spacing: { after: 300 }
    })
  )

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: data.title, bold: true, size: 36 })],
      spacing: { after: 240 }
    })
  )

  // Location
  children.push(addHeading('Location', HeadingLevel.HEADING_2))
  children.push(new Paragraph(data.location))

  // Role Overview
  children.push(addHeading('Role Overview', HeadingLevel.HEADING_2))
  children.push(new Paragraph(data.roleOverview))

  // Key Responsibilities
  children.push(addHeading('Key Responsibilities', HeadingLevel.HEADING_2))
  for (const block of data.keyResponsibilities) {
    children.push(addHeading(block.theme, HeadingLevel.HEADING_3))
    children.push(...addBullets(block.items))
  }

  // Technical Environment
  children.push(addHeading('Technical Environment', HeadingLevel.HEADING_2))
  if (data.technicalEnvironment.platform?.length) {
    children.push(addHeading('Platform', HeadingLevel.HEADING_3))
    children.push(...addBullets(data.technicalEnvironment.platform))
  }
  if (data.technicalEnvironment.scope?.length) {
    children.push(addHeading('Scope', HeadingLevel.HEADING_3))
    children.push(...addBullets(data.technicalEnvironment.scope))
  }
  for (const section of data.technicalEnvironment.additional || []) {
    children.push(addHeading(section.label, HeadingLevel.HEADING_3))
    children.push(...addBullets(section.items))
  }

  // Required Qualifications
  children.push(addHeading('Required Qualifications', HeadingLevel.HEADING_2))
  children.push(...addBullets(data.requiredQualifications))

  // Nice to Have
  children.push(addHeading('Nice to Have', HeadingLevel.HEADING_2))
  children.push(...addBullets(data.niceToHave))

  // Project Context
  children.push(addHeading('Project Context', HeadingLevel.HEADING_2))
  children.push(new Paragraph(data.projectContext))

  // Footer line
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.footerLine, italics: true, color: '555555' })],
      spacing: { before: 320 },
      alignment: AlignmentType.CENTER
    })
  )

  const doc = new Document({
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: clientName, color: '888888', size: 18 })]
              })
            ]
          })
        },
        children
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  const filename =
    (data.title || 'job_description').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') + '.docx'
  saveAs(blob, filename)
}
