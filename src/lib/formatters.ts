import type { InterviewGuide, JDSectioned, OutreachOutput } from '../types'

export function jdToPlainText(data: JDSectioned): string {
  return [
    data.title, '',
    'Location', data.location, '',
    'Role Overview', data.roleOverview, '',
    'Key Responsibilities',
    ...data.keyResponsibilities.flatMap(b => [
      b.theme,
      ...b.items.map(i => `• ${i}`)
    ]),
    '',
    'Technical Environment',
    ...(data.technicalEnvironment.platform?.length
      ? ['Platform', ...data.technicalEnvironment.platform.map(x => `• ${x}`)]
      : []),
    ...(data.technicalEnvironment.scope?.length
      ? ['Scope', ...data.technicalEnvironment.scope.map(x => `• ${x}`)]
      : []),
    ...(data.technicalEnvironment.additional?.flatMap(s =>
      [s.label, ...s.items.map(x => `• ${x}`)]
    ) ?? []),
    '',
    'Required Qualifications',
    ...data.requiredQualifications.map(x => `• ${x}`),
    '',
    'Nice to Have',
    ...data.niceToHave.map(x => `• ${x}`),
    '',
    'Project Context', data.projectContext,
    '', data.footerLine
  ].join('\n')
}

export function interviewToPlainText(data: InterviewGuide): string {
  return [
    '=== INTRODUÇÃO ===',
    data.opening,
    '',
    ...data.blocks.flatMap(block => {
      const header = `■ ${block.title} (${block.duration})`
      if (!block.questions || block.questions.length === 0) {
        // Bloco de overview — sem perguntas, só orientações
        return [header, '']
      }
      return [
        header,
        ...block.questions.flatMap((q, i) => [
          `${i + 1}. ${q.question}`,
          `   Objetivo: ${q.objective}`,
          `   ✓ Forte: ${q.strongSignals.join('; ')}`,
          `   ✗ Fraca:  ${q.weakSignals.join('; ')}`,
          ''
        ])
      ]
    }),
    '=== ENCERRAMENTO ===',
    data.closing
  ].join('\n')
}

export function outreachToPlainText(data: OutreachOutput): string {
  return [
    '====================================',
    'MENSAGEM PT — PORTUGUÊS DO BRASIL',
    '====================================',
    data.messagePT,
    '',
    '====================================',
    'MESSAGE EN — ENGLISH',
    '====================================',
    data.messageEN,
    '',
    '====================================',
    'NOTA DE CONVITE PT (≤280 chars)',
    '====================================',
    data.notePT,
    '',
    '====================================',
    'CONNECTION NOTE EN (≤280 chars)',
    '====================================',
    data.noteEN
  ].join('\n')
}
