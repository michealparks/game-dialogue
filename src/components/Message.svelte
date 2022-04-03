<script lang='ts'>
  import cx from '../lib/cx'
  import { formatDatetime } from '../lib/formatDatetime'

  export let typing = false
  export let user = false
  export let info = false
  export let value = ''
  export let image: undefined | { src: string; description: string } = undefined
  export let datetime: number | Date = 0

  const handleMessageMount = (node: HTMLElement) => {
    node.scrollIntoView()
  }
</script>

<message-bubble
  class={cx('flex flex-col w-full', {
    'origin-bottom-left': !user,
    'items-end origin-bottom-right': user,
  })}
  use:handleMessageMount
>
  <message-text
    class={cx('relative block w-fit max-w-[75%] rounded', {
      'px-4 py-2.5': !image,
      'shadow-xl': !info,
      'pb-5 text-gray-500': info,
      'bg-blue-200 rounded-br-none': user,
      'bg-gray-50 rounded-bl-none': !info && !user
    })}
  >
    {#if image}
      <img class='block w-full rounded' alt={image.description} src={image.src} />
    {/if}

    {@html value}

    {#if typing}
      <message-text class='flex gap-1'>
        <message-dot class='w-2.5 h-2.5 rounded bg-gray-200' />
        <message-dot class='w-2.5 h-2.5 rounded bg-gray-200' />
        <message-dot class='w-2.5 h-2.5 rounded bg-gray-200' />
      </message-text>
    {/if}

    {#if !info && !image}
      <div
        class={cx('absolute bottom-0 w-0 h-0 border-solid', {
          '-right-2 border-0 border-t-8 border-l-8 border-l-blue-200 border-t-transparent': user,
          '-left-2 border-b-8 border-l-8 border-b-gray-50 border-l-transparent': !user,
        })}
      />
    {/if}
  </message-text>

  {#if !typing}
    <time
      class='text-xs pt-1 px-4'
      class:hidden={info}
    >
      {formatDatetime(datetime)}
    </time>
  {/if}
</message-bubble>

<style>
  message-bubble {
    transition: transform 0.3s, opacity 0.3s;
    animation: 0.25s ease-out 0s 1 normal forwards running enter;
  }

  @keyframes enter {
    from { opacity: 0; transform: translate(0px, 8px) }
    to   { opacity: 1; transform: translate(0px, 0px) }
  }

  message-dot {
    animation: 1s linear 0s infinite normal none running pulse;
  }

  message-dot:nth-child(2) { animation-delay: 200ms; }
  message-dot:nth-child(3) { animation-delay: 400ms; }

  @keyframes pulse {
    0%   { opacity: 0.5; }
    50%  { opacity: 1.0; }
    100% { opacity: 0.5; }
  }
</style>
