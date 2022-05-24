
import type { BotResponse } from '../types'

const spaces = /\s\s+/g

export const findResponseMatch = (input: string, waitFor: BotResponse[], userInputs: Record<string, string>): BotResponse | false => {
  

  for (const [i, botResponse] of waitFor.entries()) {
    for (const answer of botResponse.answers) {
      const answerRegex = new RegExp(`\\b(${answer})\\b`, 'i')
      const readyinput = input.replace(spaces, ' ').toLowerCase().trim()

      if (readyinput.match(answerRegex)) {
        if (!botResponse.repeat) waitFor.splice(i, 1)

        if (botResponse.saveInputAs) {
          userInputs[botResponse.saveInputAs] = answer.toLowerCase()
          botResponse.saveInputAs = undefined
        }

        return botResponse
      }
    }
  }

  return false
}
