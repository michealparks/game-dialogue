<script lang="ts">

import Input from './components/Input.svelte'
import Message from './components/Message.svelte'
import { sleep } from './lib/sleep'
import { setDialogValues } from './lib/setDialogValues'
import { findResponseMatch } from './lib/findResponseMatch'
import type { Bot, BotMessage, BotResponse, MessageData, Config, BotConditionalResponse, Image, Link } from './types'

export let env: string
export let bot: Bot
export let dialogue: BotMessage[]
export let debugJumpTo: keyof BotMessage | null

let messages: MessageData[] = []
let typing = false
let pendingMessage = false
let jumped = false
let missedInput = ''
let userInputs: Record<string, string> = {}
let inputPromiseResolve: undefined | ((value: string | PromiseLike<string>) => void)
let dialogueIndex = 0

const handleInput = (e: CustomEvent) => {
  const { value } = e.detail

  startMessage({ user: true })
  commitMessage(value)

  if (inputPromiseResolve) {
    inputPromiseResolve(value)
    inputPromiseResolve = undefined
  } else {
    missedInput += ` ${value}`
  }
}

/**
 * Sets up a new promise that will resolve
 * when user input is submitted
 */
const listenForInput = (): Promise<string> => {
  if (missedInput) {
    const result = `${missedInput}`
    missedInput = ''
    return Promise.resolve(result)
  }

  return new Promise((resolve) => {
    inputPromiseResolve = resolve
  })
}

const jumpToTextItem = (key: string) => {
  if (key[0] === '$') {
    key = key.slice(1)

    dialogueIndex = dialogue
      .findIndex((item: BotMessage) => {
        const obj = item[key]
        return obj && typeof obj === 'object' && setDialogValues(obj).includes(userInputs[key])
      })
  } else {
    dialogueIndex = dialogue
      .findIndex((item) => item.key === key)
  }

  jumped = true
}

/**
 * Handles a single text item within the dialogue
 */
const textItem = async (item: BotMessage | BotResponse | BotConditionalResponse) => {
  const {
    text,
    image,
    info = false,
    sleepBefore = bot.sleepBefore,
    sleepAfter = bot.sleepAfter,
    saveInputAs,
    saveVariable,
    waitFor = [],
    conditionals = [],
    waitForAnyInput = false,
    defaultResponses = bot.responses.incorrect,
    goto,
    link,
  } = setDialogValues(item)

  if (text || image) {
    startMessage({ info, user: false })
  }

  await sleep(env === 'cypress' ? 0 : sleepBefore)

  if (text) {
    let modifiedText = text

    for (const [key, value] of Object.entries(userInputs)) {
      modifiedText = modifiedText.replace(`{${key}}`, value)
    }

    commitMessage(modifiedText)
  }

  if (image) {
    commitImage(image)
  }

  if (link) {
    startMessage()
    commitLink(link)
  }

  if (saveInputAs) {
    userInputs[saveInputAs] = await listenForInput()
  }

  if (waitForAnyInput) {
    await listenForInput()
  }

  if (saveVariable) {
    userInputs = { ...userInputs, ...saveVariable }
  }

  while (waitFor.length > 0) {
    const botResponse = findResponseMatch(await listenForInput(), waitFor, userInputs)

    if (botResponse) {
      await textItem(botResponse)
      if (botResponse.satisfies) break
    } else {
      const randomInt = Math.random() * defaultResponses.length | 0
      await textItem(defaultResponses[randomInt])
    }
  }

  for (const conditional of conditionals) {
    const { variableEquals } = conditional
    const [key, val] = variableEquals

    if (userInputs[key] === val) {
      await textItem(conditional)
      break
    }
  }

  await sleep(env === 'cypress' ? 0 : sleepAfter)

  if (goto) {
    jumpToTextItem(goto)
  }
}

const main = async () => {
  if (debugJumpTo) {
    jumpToTextItem(debugJumpTo)
    jumped = false
  }

  while (dialogueIndex < dialogue.length) {
    await textItem(dialogue[dialogueIndex]!)

    if (jumped) {
      jumped = false
    } else {
      dialogueIndex += 1
    }
  }
}

export const startMessage = (config: Config = {}) => {
  if (pendingMessage) {
    throw new Error('message already pending')
  }

  typing = !config.user && !config.info

  messages.push({
    value: '',
    datetime: Date.now(),
    ...config
  })

  pendingMessage = true
}

export const cancelMessage = () => {
  messages.pop()
}

export const commitMessage = (value: string) => {
  messages[messages.length - 1]!.value = value
  typing = false
  pendingMessage = false
  messages = messages
}

export const commitImage = (image: Image) => {
  messages[messages.length - 1]!.image = image
  typing = false
  messages = messages
  pendingMessage = false
}

const commitLink = (link: Link) => {
  messages[messages.length - 1]!.link = link
  typing = false
  messages = messages
  pendingMessage = false
}

main()

</script>

<main class='absolute top-0 left-0 w-screen h-[calc(100%-3rem)] flex flex-col overflow-y-auto bg-gray-100'>
  <chat-messages class='flex grow flex-col gap-4 p-4'>
    {#each messages as message, i (i)}
      <Message {...message} />
    {/each}

    {#if typing}
      <Message typing />
    {/if}
  </chat-messages>

  <Input on:input={handleInput} />
</main>
