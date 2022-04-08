export interface Bot {
  sleepBefore: number
  sleepAfter: number
  responses: {
    incorrect: {
      text: string
      sleepAfter: number
    }[]
  }
}

export interface Config {
  user?: boolean
  info?: boolean
}

export interface MessageData extends Config {
  value: string
  image?: { description: string; src: string }
  datetime: number
}

export interface BotResponse {
  sleepBefore: number
  answers: string[]
  sleepAfter: number
  satisfies?: true
  repeat?: true
  saveInputAs?: string
}

export interface BotConditionalResponse {
  variableEquals: string[]
  text: string
}

export interface BotMessage {
  key?: string
  sleepBefore?: number
  sleepAfter?: number
  saveInputAs?: string
  goto?: string
  text: string
  waitForAnyInput: true
  waitFor?: BotResponse[]
  info?: true
  defaultResponses?: BotMessage[]
  conditionals?: []
}

export type Variables = Record<string, string>

export interface Yaml {
  bot: Bot
  dialogue: BotMessage
  variables: Variables
}

