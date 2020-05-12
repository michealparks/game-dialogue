/**
 * @TODO move inputs onto a stack, sleeping could cause bot to miss them
 */
export const main = async (chatWidget) => {
  let missedInput = ''
  let inputs = {}
  let inputPromiseResolve
  let textItems = []

  const response = await window.fetch('./dialogue.json')
  const config = await response.json()

  const {
    defaultSleepFor,
    defaultSleepBefore,
    variables
  } = config

  const { parse, stringify } = JSON

  const getTextItems = () => {
    return parse(stringify(config.textItems))
  }

  const fillVariables = () => {
    config.textItems = parse(stringify(config.textItems, (_, value) => {
      if (!Array.isArray(value)) return value

      for (const [varKey, varVal] of Object.entries(variables)) {
        if (value.includes(varKey)) {
          value.splice(value.indexOf(varKey), 1)
          value = [...value, ...varVal]
        }
      }

      return value
    }))
  }

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
    return new Promise((resolve) => {
      inputPromiseResolve = resolve
    })
  }

  const jumpToTextItem = (key) => {
    let index

    if (key[0] === '$') {
      key = key.slice(1)

      index = config.textItems.findIndex((item) => {
        const acceptedVals = item[key]
        const inputval = inputs[key]
        return acceptedVals && acceptedVals.includes(inputval)
      })
    } else {
      index = config.textItems.findIndex((item) => {
        return item.key === key
      })
    }

    if (index > 0) {
      console.log(getTextItems().slice(index))
      return getTextItems().slice(index)
    }

    return getTextItems()
  }

  /**
   * Handles a single text item within the dialogue
   * @param {Object} item
   */
  const textItem = async (item) => {
    const {
      text,
      info = false,
      image,
      sleepFor = defaultSleepFor,
      sleepBefore = defaultSleepBefore,
      saveInputAs,
      saveVariable,
      waitFor = [],
      conditionals = [],
      waitForAnyInput = false,
      defaultResponses = config.defaultResponses,
      goto
    } = item

    if (text || image) {
      console.log('start')
      chatWidget.startMessage({ info, user: false })
    }

    await sleep(sleepBefore)

    if (text) {
      let modifiedText = text

      for (const [key, value] of Object.entries(inputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value)
      }

      console.log('commit')
      chatWidget.commitMessage(modifiedText)
    }

    if (image) {
      chatWidget.commitImage(image)
    }

    if (saveInputAs) {
      if (missedInput) {
        inputs[saveInputAs] = missedInput
        missedInput = ''
      } else {
        inputs[saveInputAs] = await listenForInput()
      }
    }

    if (saveVariable) {
      inputs = { ...inputs, ...saveVariable }
    }

    while (waitFor.length > 0) {
      let input = ''
      let match

      if (missedInput) {
        input = missedInput
        missedInput = ''
      } else {
        input = await listenForInput()
      }

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

    if (waitForAnyInput) {
      await listenForInput()
    }

    for (const conditional of conditionals) {
      const { variableEquals } = conditional
      const [key, val] = variableEquals

      if (inputs[key] === val) {
        await textItem(conditional)
        break
      }
    }

    await sleep(sleepFor)

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
      missedInput = e.detail
    }
  })

  fillVariables()

  if (config.debugJumpTo) {
    textItems = jumpToTextItem(config.debugJumpTo)
  } else {
    textItems = getTextItems()
  }

  startInputLoop()
}
