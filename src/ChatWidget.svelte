<svelte:options tag='chat-widget' />

<script>
let inputValue
let widgetElement
let inputElement
let messages = []
let typing = false
let pendingMessage = false

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  dateStyle: 'short',
  timeStyle: 'short'
})

export const startMessage = (config = {}) => {
  if (pendingMessage) {
    throw new Error('message already pending')
  }

  typing = !config.user && !config.info

  messages.push({
    value: '',
    datetime: Date.now(),
    ...config
  })

  console.log(messages[messages.length - 1])

  pendingMessage = true
}

export const cancelMessage = () => {
  messages.pop()
}

export const commitMessage = (value) => {
  messages[messages.length - 1].value = value
  typing = false
  pendingMessage = false
  messages = messages
}

export const commitImage = (imgsrc) => {
  messages[messages.length - 1].value = `<img src="${imgsrc}" />`
  typing = false
  messages = messages
  pendingMessage = false
}

const handleUserInput = () => {
  if (inputValue === '') return

  startMessage({ user: true })
  commitMessage(inputValue)

  widgetElement.dispatchEvent(new CustomEvent('userinput', {
    bubbles: true,
    cancelable: true,
    composed: true,
    target: inputElement,
    detail: inputValue
  }))

  inputValue = ''
}

const handleMessageMount = (node) => {
  node.scrollIntoView()
}

const handleKeyUp = (e) => {
  if (e.key === 'Enter') handleUserInput()
}
</script>

<chat-widget-root
  bind:this={widgetElement}
  on:mousedown={inputElement.blur}
  on:touchstart={inputElement.blur}
>
  <chat-messages>
    {#each messages as message, i (i)}
      <message-bubble class:user={message.user} use:handleMessageMount>
        <message-text
          class:info={message.info}
          class:typing={message.typing}
          class:user={message.user}
        >
          {@html message.value}
        </message-text>
        <datetime-stamp class:info={message.info}>
          {dateFormatter.format(message.datetime)}
        </datetime-stamp>
      </message-bubble>
    {/each}

    {#if typing}
      <message-bubble use:handleMessageMount>
        <message-text>
          <message-dot />
          <message-dot />
          <message-dot />
        </message-text>
      </message-bubble>
    {/if}
  </chat-messages>

  <input-box>
    <input
      type='text'
      placeholder='Send a message'
      bind:this={inputElement}
      bind:value={inputValue}
      on:keyup={handleKeyUp}
    />
    <button on:click={handleUserInput}>
      <svg viewBox="0 0 24 24">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </button>
  </input-box>

</chat-widget-root>

<style>
/**********/
/* Widget */
/**********/
* {
  --light-gray: #eee;
  --light-blue: rgba(79, 195, 247, 0.5);
  --dot-size: 10px;

  box-sizing: border-box;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

:global(a) {
  color: #00785A;
}

chat-widget-root {
  overflow: hidden;
  position: absolute;
  display: block;
  height: 100%;
  width: 100%;
  background-color: var(--light-gray);
  margin: 0;
}

chat-messages {
  overflow-y: auto;
  position: absolute;
  width: 100%;
  bottom: 50px;
  max-height: calc(100vh - 50px);
  padding: 15px;
}

/***********/
/* Message */
/***********/
message-bubble {
  width: 100%;
  transition: transform 0.3s, opacity 0.3s;
  transform-origin: 0% 100%;
  animation: 0.25s ease-out 0s 1 normal forwards running enter;
}

@keyframes enter {
  from { opacity: 0; transform: translate(0px, 8px) }
  to   { opacity: 1; transform: translate(0px, 0px) }
}

message-bubble {
  display: flex;
  flex-direction: column;
}

message-bubble.user {
  align-items: flex-end;
  transform-origin: 100% 100%;
}

message-text {
  display: block;
  position: relative;
  width: fit-content;
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 4px;
  box-shadow: -9px 9px 30px 1px rgba(0,0,0,0.2);
}

message-text.info {
  padding-bottom: 20px;
  box-shadow: none;
  color: #666;
}

message-text.user {
  background-color: var(--light-blue);
  border-bottom-right-radius: 0px;
}

message-text:not(.user) {
  background-color: var(--light-gray);
  border-bottom-left-radius: 0px;
}

message-bubble :global(img) {
  width: 100%;
  max-width: 100%;
  border-radius: 4px;
}

message-text::after {
  position: absolute;
  bottom: 0;
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
}

message-text.user::after {
  right: -8px;
  border-width: 8px 0 0 8px;
  border-color: transparent transparent transparent var(--light-blue);
}

message-text:not(.user)::after {
  left: -8px;
  border-width: 0 0 8px 8px;
  border-color: transparent transparent var(--light-gray) transparent;
}

message-dot {
  display: inline-block;
  width: var(--dot-size);
  height: var(--dot-size);
  margin: 2px 0;
  border-radius: 100%;
  background-color: #aaa;
  animation: 1s linear 0s infinite normal none running pulse;
}

message-dot:nth-child(2) { animation-delay: 200ms; }
message-dot:nth-child(3) { animation-delay: 400ms; }

@keyframes pulse {
  0%   { opacity: 0.5; }
  50%  { opacity: 1.0; }
  100% { opacity: 0.5; }
}

datetime-stamp {
  display: block;
  padding: 5px 15px 15px;
  font-size: 12px;
}

datetime-stamp.info {
  display: none;
}

/**************/
/* User Input */
/**************/
input-box {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
}

input {
  height: 50px;
  width: calc(100% - 50px);
  padding: 15px;
  margin: 0;
  border: 0;
  background-color: transparent;
  outline: none;
}

button {
  display: flex;
  justify-content: center;
  width: 50px;
  padding: 0;
  border: 0;
  background: transparent;
  outline: 0;
}

svg {
  width: 24px;
  height: 24px;
  stroke: #555;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
</style>
