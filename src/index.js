import { chatWidget } from './chat.js'

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const chat = chatWidget({
  root: document.body
})

chat.onUserInput(async (text) => {
  await sleep(3000)
  chat.insertMessage({
    text: 'Thank you, we have validated your email.'
  })
  
  await sleep(4000)

  chat.insertMessage({
    text: 'Connecting to Jesse Wright, Support Specialist...'
  })

  await sleep(6000)

  chat.insertMessage({
    text: 'Hi! Jesse here, nice to meet you. Thank you for agreeing to help us, we are very happy to have you on board.'
  })

  await sleep(5000)

  chat.insertMessage({
    text: `I'm sure you've got a lot of work ahead of you, so I won't take up any of your time:`
  })

  await sleep(6000)

  chat.insertMessage({
    text: ``
  })
})

chat.insertMessage({
  text: 'Hello! Welcome to Koschei Society webchat service. Please enter your email address below to get started.'
})

