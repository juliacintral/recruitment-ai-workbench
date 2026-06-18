export const jdSchema = {
  name: 'job_description',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      location: { type: 'string' },
      roleOverview: { type: 'string' },
      keyResponsibilities: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            theme: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } }
          },
          required: ['theme', 'items']
        }
      },
      technicalEnvironment: {
        type: 'object',
        additionalProperties: false,
        properties: {
          platform: { type: 'array', items: { type: 'string' } },
          scope: { type: 'array', items: { type: 'string' } },
          additional: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                label: { type: 'string' },
                items: { type: 'array', items: { type: 'string' } }
              },
              required: ['label', 'items']
            }
          }
        },
        required: ['platform', 'scope', 'additional']
      },
      requiredQualifications: { type: 'array', items: { type: 'string' } },
      niceToHave: { type: 'array', items: { type: 'string' } },
      projectContext: { type: 'string' },
      footerLine: { type: 'string' }
    },
    required: ['title','location','roleOverview','keyResponsibilities','technicalEnvironment','requiredQualifications','niceToHave','projectContext','footerLine']
  }
}

export const interviewSchema = {
  name: 'interview_guide',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      opening: { type: 'string' },
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            duration: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  question: { type: 'string' },
                  objective: { type: 'string' },
                  strongSignals: { type: 'array', items: { type: 'string' } },
                  weakSignals: { type: 'array', items: { type: 'string' } }
                },
                required: ['question','objective','strongSignals','weakSignals']
              }
            }
          },
          required: ['title','duration','questions']
        }
      },
      closing: { type: 'string' },
      scorecard: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            criterion: { type: 'string' },
            whatGoodLooksLike: { type: 'string' }
          },
          required: ['criterion','whatGoodLooksLike']
        }
      }
    },
    required: ['opening','blocks','closing','scorecard']
  }
}

export const outreachSchema = {
  name: 'linkedin_outreach',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      messagePT: { type: 'string' },
      messageEN: { type: 'string' }
    },
    required: ['messagePT', 'messageEN']
  }
}
