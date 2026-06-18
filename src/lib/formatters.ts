import type { InterviewGuide, JDSectioned, OutreachOutput } from '../types'

export function jdToPlainText(data: JDSectioned): string {
  return [
    data.title, '',
    'Location', data.location, '',
    'Role Overview', data.roleOverview, '',
    'Key Responsibilities',
    ...data.keyResponsibilities.flatMap((b) => [b.theme, ...b.items.map((i) => `• ${i}`)]),
    '',
    'Technical Environment',
    ...(data.technicalEnvironment.platform?.length
      ? ['Platform', ...data.technicalEnvironment.platform.map((x) => `• ${x}`)]
      : []),
    ...(data.technicalEnvironment.scope?.length
      ? ['Scope', ...data.technicalEnvironment.scope.map((x) => `• ${x}`)]
      : []),
    ...(data.technicalEnvironment.additional?.flatMap((s) =>
      [s.label, ...s.items.map((x) => `• ${x}`)]
    ) || []),
    '',
    'Required Qualifications', ...data.requiredQualifications.map((x) => `• ${x}`),
    '',
    'Nice to Have', ...data.niceToHave.map((x) => `• ${x}`),
    '',
    'Project Context', data.projectContext,
    '', data.footerLine
  ].join('\n')
}

export function interviewToPlainText(data: InterviewGuide): string {
  return [
    'Abertura', data.opening, '',
    ...data.blocks.flatMap((block) => [
      `${block.title} (${block.duration})`,
      ...block.questions.flatMap((q, i) => [
        `${i + 1}. ${q.question}`,
        `   Objetivo: ${q.objective}`,
        `   ✓ Forte: ${q.strongSignals.join('; ')}`,
        `   ✗ Fraca: ${q.weakSignals.join('; ')}`
      ]),
      ''
    ]),
    'Encerramento', data.closing, '',
    'Scorecard',
    ...data.scorecard.map((s) => `• ${s.criterion}: ${s.whatGoodLooksLike}`)
  ].join('\n')
}

export function outreachToPlainText(data: OutreachOutput): string {
  return [
    '====================================',
    'VERSÃO PT — PORTUGUÊS DO BRASIL',
    '====================================',
    data.messagePT,
    '',
    '====================================',
    'VERSÃO EN — ENGLISH',
    '====================================',
    data.messageEN
  ].join('\n')
}
