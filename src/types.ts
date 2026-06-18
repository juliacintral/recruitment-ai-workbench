export type Language = 'pt-BR' | 'en'

export type JDSectioned = {
  title: string
  location: string
  roleOverview: string
  keyResponsibilities: { theme: string; items: string[] }[]
  technicalEnvironment: {
    platform?: string[]
    scope?: string[]
    additional?: { label: string; items: string[] }[]
  }
  requiredQualifications: string[]
  niceToHave: string[]
  projectContext: string
  footerLine: string
}

export type InterviewQuestion = {
  question: string
  objective: string
  strongSignals: string[]
  weakSignals: string[]
}

export type InterviewBlock = {
  title: string
  duration: string
  questions: InterviewQuestion[]
}

export type InterviewGuide = {
  opening: string
  blocks: InterviewBlock[]
  closing: string
  scorecard: { criterion: string; whatGoodLooksLike: string }[]
}

export type OutreachOutput = {
  messagePT: string
  messageEN: string
  notePT: string
  noteEN: string
}
