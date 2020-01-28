import { chatWidget } from './chat.js'

const main = async () => {
  const inputs = {}

  let modifiedText = ''
  let inputPromiseResolve

  const response = await window.fetch('./dialogue.json')
  const config = await response.json()

  const {
    textItems = [],
    defaultSleepFor = 2,
    variables
  } = config

  /**
   * @param {number} seconds
   * @returns {Promise}
   */
  const sleep = (seconds) => {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000)
    })
  }

  const listenForInput = () => {
    return new Promise((resolve) => {
      inputPromiseResolve = resolve
    })
  }

  const textItem = async (item) => {
    const {
      text,
      sleepFor = defaultSleepFor,
      saveInputAs,
      waitFor = [],
      waitForAnyInput = false,
      defaultResponses = config.defaultResponses
    } = item

    modifiedText = text

    if (modifiedText) {
      for (const [key, value] of Object.entries(inputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value)
      }

      chat.insertMessage({ text: modifiedText })
    }

    if (saveInputAs) {
      inputs[saveInputAs] = await listenForInput()
    }

    while (waitFor.length > 0) {
      const input = await listenForInput()

      let match

      for (const child of waitFor) {
        let accepted = child.acceptedInputs.map((str) => str.toLowerCase())

        for (const [key, value] of Object.entries(variables)) {
          if (accepted.includes(key)) {
            accepted.splice(accepted.indexOf(key), 1)
            accepted = [...accepted, ...value]
          }
        }

        if (accepted.includes(input.toLowerCase())) {
          match = child
          waitFor.splice(waitFor.indexOf(child), 1)
          break
        }
      }

      if (match) {
        await textItem(match)
      } else {
        const rand = Math.random() * defaultResponses.length | 0
        await textItem(defaultResponses[rand])
      }
    }

    if (waitForAnyInput) {
      await listenForInput()
    }

    await sleep(sleepFor)
  }

  document.head.querySelector('title').textContent = 'Koschei Society'

  const chat = chatWidget({
    root: document.body
  })

  chat.onUserInput((text) => {
    if (inputPromiseResolve) {
      inputPromiseResolve(text)
    }
  })

  for (const item of textItems) {
    await textItem(item)
  }
}

main()
