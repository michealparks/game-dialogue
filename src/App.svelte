<script lang='ts'>
import Chat from './Chat.svelte'
import { bot, dialogue } from './assets/dialogue.yaml'
import type { BotMessage } from './types'

const debugJumpTo = new URLSearchParams(window.location.search).get('debug') as keyof BotMessage
const env = window.sessionStorage.getItem('env') ?? ''
</script>

<Chat
  {env}
  {bot}
  {dialogue}
  {debugJumpTo}
/>
