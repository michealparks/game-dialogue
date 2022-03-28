<script lang='ts'>

import Chat from './Chat.svelte'

const main = async () => {
  const url = new URL('./assets/dialogue.json', import.meta.url)
  const response = await window.fetch(url.href)

  if (response.ok === false) {
    const text = await response.text()
    throw new Error(`Status ${response.status}: ${text}`)
  }

  const config = await response.json()
  const debugJumpTo = new URLSearchParams(window.location.search).get('debug')

  const env = window.sessionStorage.getItem('env')

  return { ...config, debugJumpTo, env }
}

</script>

{#await main()}
  <!-- -->
{:then { bot, dialogue, variables, debugJumpTo, env }} 
  <Chat
    {env}
    {bot}
    {dialogue}
    {variables}
    {debugJumpTo}
  />
{:catch error}
	<p class='p-2 text-white bg-red-500'>
    {JSON.stringify(error)}
  </p>
{/await}
