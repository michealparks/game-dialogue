<svelte:head>
  <title>Koschei Society</title>
</svelte:head>

<script>
import { onMount } from 'svelte'
import { main } from './index.js'

let chatWidget

onMount(() => {
  main(chatWidget)
})
</script>

<chat-widget bind:this={chatWidget} />

<style>
:global(body) {
  margin: 0
}
</style>