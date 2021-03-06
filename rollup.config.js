import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

import pkg from "./package.json";
const env = process.env.NODE_ENV;

export default {
  input: "src/index.js",
  output: {
    file: {
      es: pkg.module,
      iife: pkg.main
    }[env],
    format: env,
    name: "customel"
  },
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**"
    })
  ]
};
