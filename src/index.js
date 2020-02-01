// import smoothscroll from 'smoothscroll-polyfill'
import { chatWidget } from './chat.js'

// @TODO move inputs onto a stack, sleeping could disrupt them
const main = async () => {
  // smoothscroll.polyfill()

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
      sleepBefore,
      saveInputAs,
      waitFor = [],
      waitForAnyInput = false,
      defaultResponses = config.defaultResponses
    } = item

    if (sleepBefore) {
      await sleep(sleepBefore)
    }

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
        let accepted = child.acceptedInputs

        for (const [key, value] of Object.entries(variables)) {
          if (accepted.includes(key)) {
            accepted.splice(accepted.indexOf(key), 1)
            accepted = [...accepted, ...value]
          }
        }

        for (const str of accepted) {
          if (input.toLowerCase().includes(str.toLowerCase())) {
            match = child
            waitFor.splice(waitFor.indexOf(child), 1)
            break
          }
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