const fillVariables = (obj, vars) => {
  const varkeys = Object.keys(vars)

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      fillVariables(value, vars)
    } else if (Array.isArray(value)) {
      for (const varKey of varkeys) {
        const i = value.indexOf(varKey)
        if (i !== -1) {
          obj[key].splice(i, 1)
          obj[key] = [...obj[key], ...vars[varKey]]
        }
      }
    } else {
      const i = varkeys.indexOf(value)
      if (i !== -1) {
        obj[key] = [...vars[varkeys[i]]]
      }
    }
  }
}

const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const main = async (chatWidget) => {
  let missedInput = ''
  let inputs = {}
  let inputPromiseResolve
  let textItems = []

  const response = await window.fetch('./dialogue.json')
  const config = await response.json()
  const debugJumpTo = window.location.hash.slice(1)
  const { bot, dialogue } = config

  fillVariables(dialogue, config.variables)

  const startInputLoop = async () => {
    while (textItems.length > 0) {
      await textItem(textItems.shift())
    }
  }

  /**
   * Promisify setTimeout. Sleeps for n seconds.
   * @param {number} seconds
   * @returns {Promise}
   */
  const sleep = (seconds) => {
    if (seconds === 0) return Promise.resolve()

    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000)
    })
  }

  /**
   * Sets up a new promise that will resolve
   * when user input is submitted
   * @returns {Promise}
   */
  const listenForInput = () => {
    if (missedInput) {
      return Promise.resolve(missedInput)
    }

    return new Promise((resolve) => {
      inputPromiseResolve = resolve
    })
  }

  const jumpToTextItem = (key) => {
    let index

    if (key[0] === '$') {
      key = key.slice(1)

      index = dialogue.findIndex((item) => {
        const acceptedVals = item[key]
        const inputval = inputs[key]
        return acceptedVals && acceptedVals.includes(inputval)
      })
    } else {
      index = dialogue.findIndex((item) => item.key === key)
    }

    if (index > 0) {
      return clone(dialogue).slice(index)
    }

    return clone(dialogue)
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
    } = item

    if (text || image) {
      chatWidget.startMessage({ info, user: false })
    }

    await sleep(sleepBefore)

    if (text) {
      let modifiedText = text

      for (const [key, value] of Object.entries(inputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value)
      }

      chatWidget.commitMessage(modifiedText)
    }

    if (image) {
      chatWidget.commitImage(image)
    }

    if (saveInputAs) {
      inputs[saveInputAs] = await listenForInput()
    }

    if (waitForAnyInput) {
      await listenForInput()
    }

    if (saveVariable) {
      inputs = { ...inputs, ...saveVariable }
    }

    while (waitFor.length > 0) {
      let match

      const input = await listenForInput()

      for (const child of waitFor) {
        if (match) break

        for (const acceptedInput of child.acceptedInputs) {
          const sanitized = input.replace(/\s\s+/g, ' ').toLowerCase()

          if (sanitized.includes(acceptedInput.toLowerCase())) {
            match = child

            if (match.continue !== true) {
              waitFor.splice(waitFor.indexOf(child), 1)
            }

            if (child.saveInputAs) {
              inputs[child.saveInputAs] = input.toLowerCase()
              delete child.saveInputAs
            }

            break
          }
        }
      }

      if (match) {
        await textItem(match)

        if (match.break) break
      } else {
        const rand = Math.random() * defaultResponses.length | 0
        await textItem(defaultResponses[rand])
      }
    }

    for (const conditional of conditionals) {
      const { variableEquals } = conditional
      const [key, val] = variableEquals

      if (inputs[key] === val) {
        await textItem(conditional)
        break
      }
    }

    await sleep(sleepAfter)

    if (goto) {
      textItems = jumpToTextItem(goto)
      return true
    }

    return false
  }

  chatWidget.addEventListener('userinput', (e) => {
    if (inputPromiseResolve) {
      inputPromiseResolve(e.detail)
    } else {
      missedInput += ` ${e.detail}`
    }
  })

  if (debugJumpTo) {
    textItems = jumpToTextItem(debugJumpTo)
  } else {
    textItems = cloneDialogue()
  }

  startInputLoop()
}
