import { sleep, setVariables } from './util.js'

export const main = async (chatWidget) => {
  let jumped = false
  let missedInput = ''
  let savedUserInputs = {}
  let inputPromiseResolve
  let dialogueIndex = 0

  const response = await window.fetch('./dialogue.json')
  const config = await response.json()
  const debugJumpTo = new URLSearchParams(window.location.search).get('debug')
  const { bot, dialogue, variables } = config

  /**
   * Sets up a new promise that will resolve
   * when user input is submitted
   * @returns {Promise}
   */
  const listenForInput = () => {
    console.log('missedInput: ', missedInput)
    if (missedInput) {
      const result = `${missedInput}`
      missedInput = ''
      return Promise.resolve(result)
    }

    return new Promise((resolve) => {
      inputPromiseResolve = resolve
    })
  }

  const jumpToTextItem = (key) => {
    if (key[0] === '$') {
      key = key.slice(1)

      dialogueIndex = dialogue
        .findIndex((item) => {
          return item[key] && setVariables(item[key], variables).includes(savedUserInputs[key])
        })
    } else {
      dialogueIndex = dialogue
        .findIndex((item) => item.key === key)
    }

    jumped = true
    console.log('jump: ', dialogueIndex, dialogue[dialogueIndex])
  }

  const findMatch = (input, wait) => {
    const spaces = /\s\s+/g

    let i = 0
    for (const item of wait) {
      for (const answer of item.answers) {
        const readyinput = input.replace(spaces, ' ').toLowerCase()
        if (readyinput.includes(answer.toLowerCase())) {
          const match = item

          if (!match.repeat) wait.splice(i, 1)

          if (match.saveInputAs) {
            savedUserInputs[match.saveInputAs] = readyinput
            match.saveInputAs = undefined
          }

          return match
        }
      }

      i += 1
    }
  }

  /**
   * Handles a single text item within the dialogue
   * @param {Object} item
   */
  const textItem = async (item) => {
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
    } = setVariables(item, variables)

    console.log('item: ', item)

    if (text || image) {
      chatWidget.startMessage({ info, user: false })
    }

    await sleep(sleepBefore)

    if (text) {
      let modifiedText = text

      for (const [key, value] of Object.entries(savedUserInputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value)
      }

      chatWidget.commitMessage(modifiedText)
    }

    if (image) {
      chatWidget.commitImage(image)
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
      console.log('waitFor: ', waitFor)

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

    await sleep(sleepAfter)

    if (goto) {
      jumpToTextItem(goto)
    }
  }

  chatWidget.addEventListener('userinput', (e) => {
    console.log('userInput: ', e.detail, inputPromiseResolve)
    if (inputPromiseResolve) {
      inputPromiseResolve(e.detail)
      inputPromiseResolve = undefined
    } else {
      missedInput += ` ${e.detail}`
    }
  })

  if (debugJumpTo) {
    jumpToTextItem(debugJumpTo)
    jumped = false
  }

  while (dialogueIndex < dialogue.length) {
    await textItem(dialogue[dialogueIndex])

    console.log(jumped, dialogueIndex)
    if (jumped) {
      jumped = false
    } else {
      dialogueIndex += 1
    }
  }
}
