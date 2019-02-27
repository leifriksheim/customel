import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

import pkg from "./package.json";
const env = process.env.NODE_ENV;

export default {
  input: "index.js",
  output: {
    file: {
      es: pkg.module,
      cjs: pkg.main
    }[env],
    format: env
  },
  external: ["react", "styled-components"],
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**"
    })
  ]
};
