import os from 'os'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import serve from 'rollup-plugin-serve'
import filesize from 'rollup-plugin-filesize'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'

const {
  DEV = false,
  PROD = false
} = process.env

const plugins = [
  resolve(),
  replace({
    DEV
  }),
  PROD && terser(),
  PROD && filesize({
    showMinifiedSize: false,
    showGzippedSize: false
  })
]

export default [{
  input: './src/ChatWidget.svelte',
  output: {
    file: './build/chat.js',
    format: 'esm',
    sourcemap: DEV
  },
  plugins: [
    svelte({ customElement: true, css: false }),
    ...plugins
  ]
}, {
  input: './src/index.svelte',
  output: {
    file: './build/index.js',
    format: 'esm',
    sourcemap: DEV
  },
  plugins: [
    svelte({
      css: (css) => {
        css.write('build/index.css')
      }
    }),
    DEV && serve({
      open: true,
      contentBase: ['build'],
      port: 7000,
      host: Object.values(os.networkInterfaces())
        .flat()
        .find((iface) => !iface.internal && iface.family === 'IPv4').address
    }),
    ...plugins
  ]
}]
