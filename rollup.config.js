import os from 'os'
import commonjs from '@rollup/plugin-commonjs'
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
    commonjs(),
    replace({
      DEV
    }),
    serve({
      open: true,
      contentBase: ['build'],
      port: 7000,
      host: Object.values(os.networkInterfaces())
        .flat()
        .find((iface) => !iface.internal && iface.family === 'IPv4').address
    }),
    DEV ? undefined : terser()
  ]
}]
