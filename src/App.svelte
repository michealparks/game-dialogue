<script lang='ts'>
import Chat from './Chat.svelte'
import { bot, dialogue, variables } from './assets/dialogue.yaml'
import type { Dialog } from './types'

const debugJumpTo = new URLSearchParams(window.location.search).get('debug') as keyof Dialog
const env = window.sessionStorage.getItem('env') ?? ''
</script>

<Chat
  {env}
  {bot}
  {dialogue}
  {variables}
  {debugJumpTo}
/>
