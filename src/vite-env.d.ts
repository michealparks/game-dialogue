/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module '*.yaml' {
  const value: {
    bot: unknown
    dialogue: unknown
    variables: unknown
  }
  export = value;
}
