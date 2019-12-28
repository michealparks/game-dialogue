import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import serve from 'rollup-plugin-serve'
import { terser } from 'rollup-plugin-terser'

const DEV = process.env.DEV

export default [{
  input: './src/index.js',
  output: {
    name: 'index.js',
    file: './build/index.js',
    format: 'esm'
  },
  plugins: [
    resolve({
      mainFields: ['module', 'main']
    }),
    replace({
      DEV
    }),
    serve({
      open: true,
      contentBase: ['build'],
      port: 7000
    }),
    DEV ? undefined : terser()
  ]
}]
