import { chatWidget } from './chat.js'

const chat = chatWidget({
  root: document.body
})

chat.insertMessage({
  text: 'Hello! Welcome to Koschei Society webchat service. Please enter your email address below to get started.'
})

