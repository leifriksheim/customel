import { typeOf, uuid } from "./utils.js";

export function html(parts, ...args) {
  const template = parts.reduce(
    (acc, part, i) => {
      // if no string put in first part
      if (!acc.string) {
        return { events: acc.events, string: part };
      }

      const arg = args[i - 1];

      if (arg === null) {
        return {
          events: acc.events,
          string: acc.string
        };
      }

      if (typeOf(arg) === "function") {
        // hash the function string to make an id
        const id = uuid();

        return {
          events: { ...acc.events, [id]: arg },
          string: acc.string + id + part
        };
      }

      if (typeOf(arg) === "array") {
        const allEvents = arg.reduce((acc, a) => {
          return { ...acc, ...a.events };
        }, {});
        const string = arg.reduce((acc, a) => acc + a.string, "");
        return {
          events: { ...acc.events, ...allEvents },
          string: acc.string + string + part
        };
      }

      if (typeOf(arg) === "object") {
        return {
          events: { ...acc.events, ...arg.events },
          string: acc.string + arg.string + part
        };
      }

      return {
        events: { ...acc.events },
        string: acc.string + args[i - 1] + part
      };
    },
    { events: {}, string: null }
  );

  return template;
}
