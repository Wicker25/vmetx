import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/server/main.ts',
    output: {
      format: 'cjs',
      name: 'vmetx-server',
      file: './dist/vmetx-server.js'
    },
    plugins: [
      typescript({
        module: 'commonjs',
        target: 'es2017'
      })
    ]
  },
  {
    input: 'src/tracers/main.ts',
    output: {
      format: 'umd',
      name: 'vmetx',
      file: './dist/vmetx.js'
    },
    plugins: [
      typescript(),
      commonjs({
        jsnext: true,
        extensions: ['.js', '.ts']
      }),
      resolve({ browser: true, preferBuiltins: true }),
      uglify()
    ]
  },
  {
    input: 'src/tracers/main.ts',
    output: {
      format: 'iife',
      name: 'vmetx',
      file: './dist/vmetx.iife.js'
    },
    plugins: [
      typescript(),
      commonjs({
        jsnext: true,
        extensions: ['.js', '.ts']
      }),
      resolve({ browser: true, preferBuiltins: true }),
      uglify()
    ]
  }
];
