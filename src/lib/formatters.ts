import type { InterviewGuide, JDSectioned, OutreachOutput } from '../types'

export function jdToPlainText(data: JDSectioned): string {
  return [
    data.title,
    '',
    'Location',
    data.location,
    '',
    'Role Overview',
    data.roleOverview,
    '',
    'Key Responsibilities',
    ...data.keyResponsibilities.flatMap((section) => [
      section.theme,
      ...section.items.map((item) => `  - ${item}`)
    ]),
    '',
    'Technical Environment',
    ...(data.technicalEnvironment.platform?.length
      ? ['Platform', ...data.technicalEnvironment.platform.map((x) => `  - ${x}`)]
      : []),
    ...(data.technicalEnvironment.scope?.length
      ? ['Scope', ...data.technicalEnvironment.scope.map((x) => `  - ${x}`)]
      : []),
    ...(data.technicalEnvironment.additional?.flatMap((s) => [
      s.label,
      ...s.items.map((x) => `  - ${x}`)
    ]) || []),
    '',
    'Required Qualifications',
    ...data.requiredQualifications.map((x) => `  - ${x}`),
    '',
    'Nice to Have',
    ...data.niceToHave.map((x) => `  - ${x}`),
    '',
    'Project Context',
    data.projectContext,
    '',
    data.footerLine
  ].join('\n')
}

export function interviewToPlainText(data: InterviewGuide): string {
  return [
    'ABERTURA',
    data.opening,
    '',
    ...data.blocks.flatMap((block) => [
      `${block.title.toUpperCase()} (${block.duration})`,
      '',
      ...block.questions.flatMap((q, i) => [
        `${i + 1}. ${q.question}`,
        `   Objetivo: ${q.objective}`,
        `   Resposta forte: ${q.strongSignals.join('; ')}`,
        `   Resposta fraca: ${q.weakSignals.join('; ')}`,
        ''
      ])
    ]),
    'ENCERRAMENTO',
    data.closing,
    '',
    'SCORECARD',
    ...data.scorecard.map((s) => `  - ${s.criterion}: ${s.whatGoodLooksLike}`)
  ].join('\n')
}

export function outreachToPlainText(data: OutreachOutput): string {
  return [
    'RATIONALE',
    data.rationale,
    '',
    'MENSAGEM PRINCIPAL',
    data.mainMessage,
    '',
    'FOLLOW-UP',
    data.followUp,
    '',
    'GANCHOS DE PERSONALIZAÇÃO',
    ...data.personalizationHooks.map((x) => `  - ${x}`)
  ].join('\n')
}
