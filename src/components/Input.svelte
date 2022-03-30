<script lang='ts'>

import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

let input: HTMLInputElement
let value = ''

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleUserInput()
  }
}

const handleMessageSubmit = () => {
  handleUserInput()
}

const handleUserInput = () => {
  if (value === '') return

  dispatch('input', { value })

  value = ''

  input.blur()
}
</script>

<input-box class='fixed bottom-0 left-0 flex h-12 w-full bg-white'>
  <input
    class='h-full w-[calc(100vw-3rem)] p-3.5 m-0 border-0 bg-transparent outline-none'
    type='text'
    placeholder='Send a message'
    bind:this={input}
    bind:value={value}
    on:keyup={handleKeyUp}
  />
  <button
    aria-label="Send message"
    class='grid place-content-center h-full w-12 p-0 border-0 bg-transparent outline-none'
    on:click={handleMessageSubmit}
  >
    <svg
      viewBox="0 0 24 24"
      class='w-6 h-6'
      style="
        stroke: #555;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      "
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  </button>
</input-box>
