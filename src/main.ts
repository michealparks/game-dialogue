import * as Sentry from '@sentry/browser'
import { BrowserTracing } from '@sentry/tracing'
import './main.css'
import App from './App.svelte'

export default new App({
  target: document.querySelector('#app')!,
})

Sentry.init({
  dsn: 'https://37267ffdc29e46899c67a4ad442cf267@o1187721.ingest.sentry.io/6307556',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.8,
})
