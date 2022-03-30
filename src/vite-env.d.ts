/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module "*.yaml" {
  const value: {
    bot: any
    dialogue: any
    variables: any
  };
  export = value;
}
