export function css(parts, ...args) {
  return parts.reduce((acc, part, i) => {
    return acc + part + args[i];
  }, "");
}
