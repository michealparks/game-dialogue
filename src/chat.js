export const chatWidget = (config) => {
  const listeners = []

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  })

  const widget = document.createElement('chat-widget')
  
  widget.innerHTML = `
    <messages-box></messages-box>
    <input-box>
      <input type="text" placeholder="Send a message">
      <button>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </input-box>
  `

  config.root.appendChild(widget)

  const messagesBox = document.querySelector('messages-box')
  const input = document.querySelector('input-box input')
  const button = document.querySelector('input-box button')

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserSubmit()
  }, { passive: true })

  button.addEventListener('click', (e) => {
    handleUserSubmit()
  }, { passive: true })
  
  const handleUserSubmit = () => {
    if (input.value === '') return

    const text = input.value

    insertMessage({
      text,
      align: 'right',
    })

    for (const fn of listeners) {
      fn(text)
    }

    input.value = ''
  }

  const onUserInput = (callback) => {
    listeners.push(callback)
  }

  const insertMessage = ({
    text = '',
    align = 'left'
  }) => {
    const messageBubble = document.createElement('message-bubble')

    messageBubble.classList.toggle('left', align === 'left')
    messageBubble.classList.toggle('right', align === 'right')

    messageBubble.innerHTML = `
      <message-bubble-text>
        ${text}
      </message-bubble-text>
      <message-bubble-timestamp>
        ${dateFormatter.format(new Date())}
      </message-bubble-timestamp>
    `

    messagesBox.appendChild(messageBubble)

    messageBubble.scrollIntoView()
  }

  return {
    onUserInput,
    insertMessage
  }
}
