<script lang="ts">

import Input from './components/Input.svelte'
import Message from './components/Message.svelte'
import { sleep } from './lib/sleep'
import { setDialogValues } from './lib/setDialogValues'
import type { Bot, Dialog, MessageData, Config, DialogAnswer, Variables } from './types'

export let env: string
export let bot: Bot
export let dialogue: Dialog[]
export let variables: Variables
export let debugJumpTo: keyof Dialog

let messages: MessageData[] = []
let typing = false
let pendingMessage = false
let jumped = false
let missedInput = ''
let savedUserInputs: Record<string, string> = {}
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

const jumpToTextItem = (key: keyof Dialog) => {
  if (key[0] === '$') {
    key = key.slice(1) as keyof Dialog

    dialogueIndex = dialogue
      .findIndex((item: Dialog) => {
        const obj = item[key]
        return obj && setDialogValues(obj as object, variables).includes(savedUserInputs[key])
      })
  } else {
    dialogueIndex = dialogue
      .findIndex((item) => item.key === key)
  }

  jumped = true
}

const findMatch = (input: string, wait: DialogAnswer[]): DialogAnswer | false => {
  const spaces = /\s\s+/g

  for (const [i, item] of wait.entries()) {
    for (const answer of item.answers!) {
      const readyinput = input.replace(spaces, ' ').toLowerCase()
      if (readyinput.includes(answer.toLowerCase())) {
        const match = item

        if (!match.repeat) wait.splice(i, 1)

        if (match.saveInputAs) {
          savedUserInputs[match.saveInputAs]! = readyinput
          match.saveInputAs = undefined
        }

        return match
      }
    }
  }

  return false
}

/**
 * Handles a single text item within the dialogue
 */
const textItem = async (item: object) => {
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
    goto
  } = setDialogValues(item, variables)

  if (text || image) {
    startMessage({ info, user: false })
  }

  await sleep(env === 'cypress' ? 0 : sleepBefore)

  if (text) {
    let modifiedText = text

    for (const [key, value] of Object.entries(savedUserInputs)) {
      modifiedText = modifiedText.replace(`{${key}}`, value)
    }

    commitMessage(modifiedText)
  }

  if (image) {
    commitImage(image)
  }

  if (saveInputAs) {
    savedUserInputs[saveInputAs] = await listenForInput()
  }

  if (waitForAnyInput) {
    await listenForInput()
  }

  if (saveVariable) {
    savedUserInputs = { ...savedUserInputs, ...saveVariable }
  }

  while (waitFor.length > 0) {
    const match = findMatch(await listenForInput(), waitFor)

    if (match) {
      await textItem(match)
      if (match.satisfies) break
    } else {
      const rand = Math.random() * defaultResponses.length | 0
      await textItem(defaultResponses[rand])
    }
  }

  for (const conditional of conditionals) {
    const { variableEquals } = conditional
    const [key, val] = variableEquals

    if (savedUserInputs[key] === val) {
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

export const commitImage = (imgsrc: string) => {
  messages[messages.length - 1]!.value = `<img src="${imgsrc}" />`
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
