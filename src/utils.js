// Return the true type of value
export function typeOf(value) {
  return Object.prototype.toString
    .call(value)
    .slice(8, -1)
    .toLowerCase();
}

export function sanitizeHTML(string) {
  var temp = document.createElement("div");
  temp.textContent = string;
  return temp.innerHTML;
}

export function uuid() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

const invalidChars = /[^a-zA-Z0-9:]+/g;

// Return kebab-case
export function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, match => match[0] + "-" + match[1])
    .replace(invalidChars, "-")
    .toLowerCase();
}

// Return camlCase
export function camelCase(str) {
  return str
    .replace(/_/g, (_, index) => (index === 0 ? _ : "-"))
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(invalidChars, "");
}

// Typecast attributes
export function typeCast(value, type) {
  if (type === "boolean") {
    if (value === "true" || value === "" || value === true) {
      return true;
    } else {
      return false;
    }
  }

  if (type === "number") {
    return parseInt(value);
  }

  if (type === "string") {
    return String(value);
  }

  return value;
}

export function onChange(object, onChange) {
  const handler = {
    get(target, property, receiver) {

      const desc = Object.getOwnPropertyDescriptor(target, property);

      if (desc && !desc.writable && !desc.configurable) {
        return Reflect.get(target, property, receiver)
      }

      try {
        return new Proxy(target[property], handler);
      } catch (err) {
        return Reflect.get(target, property, receiver);
      }
    },
    defineProperty(target, property, descriptor) {
      onChange(descriptor);
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      onChange();
      return Reflect.deleteProperty(target, property);
    }
  };
  return new Proxy(object, handler);
}
