import resolve from '@rollup/plugin-node-resolve';

export default {
  input: "src/index.js",
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
      name: "glucose"
    },
    {
      file: "build/index.js",
      format: "iife",
      name: "glucose"
    },
    {
      file: "build/index.cjs.js",
      format: "cjs",
      name: "glucose"
    }

  ],
  plugins: [
    resolve()
  ]
};
