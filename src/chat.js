import { style } from './chat-style'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  dateStyle: 'short',
  timeStyle: 'short'
})

window.customElements.define('chat-widget', class ChatWidget extends HTMLElement {
  constructor (props) {
    super(props)
  
    this.listeners = []
    this.pendingMessages = { remote: undefined, user: undefined }
    this.root = this.attachShadow({ mode: 'open' })
    this.root.innerHTML = `
      <style>${style}</style>
      <chat-bg>
        <messages-box></messages-box>
        <input-box>
          <input type="text" placeholder="Send a message">
          <button>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </input-box>
      </chat-bg>
    `
  }

  connectedCallback () {
    this.messagesBox = this.root.querySelector('messages-box')
    this.input = this.root.querySelector('input-box input')
    this.button = this.root.querySelector('input-box button')

    const handleUserSubmit = () => {
      if (this.input.value === '') return

      const text = this.input.value

      this.startMessage({ origin: 'user' })
      this.commitMessage({ text, origin: 'user' })

      for (const fn of this.listeners) {
        fn(text)
      }

      this.input.value = ''
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleUserSubmit()
    }

    this.input.addEventListener('keydown', handleKeyDown, { passive: true })

    this.messagesBox.addEventListener('mousedown', this.input.blur, { passive: true })
    this.messagesBox.addEventListener('touchstart', this.input.blur, { passive: true })

    this.button.addEventListener('click', (e) => {
      handleUserSubmit()
      this.input.focus()
    }, { passive: true })
  }

  /**
   * Listen for when a user submits a message
   * @param {Function} callback
   */
  onUserInput (callback) {
    this.listeners.push(callback)
  }

  /**
   * Trigger the start of a new message
   * @param {Object} props
   */
  startMessage ({ origin = 'remote' }) {
    const message = document.createElement('message-bubble')
    message.classList.add('empty', 'entering')
    message.classList.add(origin === 'remote' ? 'left' : 'right')

    message.innerHTML = `
      <message-text>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </message-text>
      <message-timestamp></message-timestamp>
    `

    this.pendingMessages[origin] = message

    this.messagesBox.appendChild(message)
    message.scrollIntoView()
    setTimeout(() => message.classList.remove('entering'), 100)
  }

  /**
   * Send the message to the screen
   * @param {Object} props
   */
  commitMessage ({ text = '', origin = 'remote' }) {
    const message = this.pendingMessages[origin]
    message.querySelector('message-text').innerHTML = text
    message.querySelector('message-timestamp').textContent = dateFormatter.format(new Date())
    message.classList.remove('empty')
    message.scrollIntoView()
  }

  commitImage ({ image, origin = 'remote' }) {
    const message = this.pendingMessages[origin]
    message.classList.add('image')
    message.querySelector('message-text').innerHTML = `
      <img src="${image}" />
    `
  }
})
