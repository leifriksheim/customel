const emerj = {
  attrs(elem) {
    if (!elem.attributes) return {};
    const attrs = {};

    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      attrs[attr.name] = attr.value;
    }

    return attrs;
  },

  nodesByKey(parent, makeKey) {
    const map = {};

    for (let j = 0; j < parent.childNodes.length; j++) {
      const key = makeKey(parent.childNodes[j]);
      if (key) map[key] = parent.childNodes[j];
    }

    return map;
  },

  walkAndAddProps(node, events) {
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

    while (treeWalker.nextNode()) {
      const currentNode = treeWalker.currentNode;
      const currentAttrs = this.attrs(currentNode);

      for (const attr in currentAttrs) {
        if (attr in currentNode) {
          if (attr.startsWith('on')) {
            currentNode.addEventListener(attr.slice(2), events[currentAttrs[attr]]);
            currentNode.removeAttribute(attr);
          } else {
            currentNode[attr] = currentAttrs[attr];
          }
        }
      }
    }
  },

  merge(base, modified, opts, events) {
    opts = opts || {};

    opts.key = opts.key || (node => node.id); // If there's no content in the base, it we need to populate the
    // node


    if (!base.childNodes.length) {
      const html = modified;
      base.innerHTML = html;
      this.walkAndAddProps(base, events);
      return;
    }

    const html = modified;
    modified = document.createElement('div');
    modified.innerHTML = html; // Naively recurse into the children, if any, replacing or updating new
    // elements that are in the same position as old, deleting trailing elements
    // when the new list contains fewer children, or appending new elements if
    // it contains more children.
    //
    // For re-ordered children, the `id` attribute can be used to preserve identity.
    // Loop through .childNodes, not just .children, so we compare text nodes (and
    // comment nodes, fwiw) too.

    const nodesByKey = {
      old: this.nodesByKey(base, opts.key),
      new: this.nodesByKey(modified, opts.key)
    };
    let idx;

    for (idx = 0; modified.firstChild; idx++) {
      const newNode = modified.removeChild(modified.firstChild);

      if (idx >= base.childNodes.length) {
        // It's a new node. Add event listeners if any and, append it.
        this.walkAndAddProps(newNode, events);
        base.appendChild(newNode);
        continue;
      }

      let baseNode = base.childNodes[idx]; // If the children are indexed, then make sure to retain their identity in
      // the new order.

      const newKey = opts.key(newNode);

      if (opts.key(baseNode) || newKey) {
        // If the new node has a key, then either use its existing match, or insert it.
        // If not, but the old node has a key, then make sure to leave it untouched and insert the new one instead.
        // Else neither node has a key. Just overwrite old with new.
        const match = newKey && newKey in nodesByKey.old ? nodesByKey.old[newKey] : newNode;

        if (match !== baseNode) {
          baseNode = base.insertBefore(match, baseNode);
        }
      }

      if (baseNode.nodeType !== newNode.nodeType || baseNode.tagName !== newNode.tagName) {
        // Completely different node types. Just update the whole subtree, like React does.
        this.walkAndAddProps(newNode, events);
        base.replaceChild(newNode, baseNode);
      } else if ([Node.TEXT_NODE, Node.COMMENT_NODE].indexOf(baseNode.nodeType) >= 0) {
        // This is the terminating case of the merge() recursion.
        if (baseNode.textContent === newNode.textContent) continue; // Don't write if we don't need to.

        baseNode.textContent = newNode.textContent;
      } else if (baseNode !== newNode) {
        // Only need to update if we haven't just inserted the newNode in.
        // It's an existing node with the same tag name. Update only what's necessary.
        // First, make dicts of attributes, for fast lookup:
        const attrs = {
          base: this.attrs(baseNode),
          new: this.attrs(newNode)
        };

        for (const attr in attrs.base) {
          // Remove any missing attributes.
          if (attr in attrs.new) continue;
          baseNode.removeAttribute(attr);
        }

        for (const attr in attrs.new) {
          const hasProperty = attr in baseNode; // Add and update any new or modified attributes.

          if (attr in attrs.base && attrs.base[attr] === attrs.new[attr] && !hasProperty) {
            continue;
          } // check if node has property, set it as property and not attribute


          if (hasProperty) {
            baseNode.removeAttribute(attr);
            baseNode[attr] = attr.startsWith('on') ? events[attrs.new[attr]] : attrs.new[attr];
          } else {
            baseNode.setAttribute(attr, attrs.new[attr]);
          }
        } // Now, recurse into the children. If the only children are text, this will
        // be the final recursion on this node.


        this.merge(baseNode, newNode, {}, events);
      }
    }

    while (base.childNodes.length > idx) {
      // If base has more children than modified, delete the extras.
      base.removeChild(base.lastChild);
    }
  }

};

// Simple JavaScript Templating
// Paul Miller (http://paulmillr.com)
// http://underscorejs.org
// (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
var settings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
}; // When customizing `templateSettings`, if you don't want to define an
// string literal.

var escapes = {
  "'": "'",
  "\\": "\\",
  "\r": "r",
  "\n": "n",
  "\t": "t",
  "\u2028": "u2028",
  "\u2029": "u2029"
};
var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g; // List of HTML entities for escaping.

var htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;"
};
var entityRe = new RegExp("[&<>\"']", "g");

var escapeExpr = function (string) {
  if (string == null) return "";
  return ("" + string).replace(entityRe, function (match) {
    return htmlEntities[match];
  });
};

var counter = 0; // JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.

function tmpl(text, data) {
  var render; // Combine delimiters into one regular expression via alternation.

  var matcher = new RegExp([(settings.escape).source, (settings.interpolate).source, (settings.evaluate).source].join("|") + "|$", "g"); // Compile the template source, escaping string literals appropriately.

  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escaper, function (match) {
      return "\\" + escapes[match];
    });

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':escapeExpr(__t))+\n'";
    }

    if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    }

    if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    index = offset + match.length;
    return match;
  });
  source += "';\n"; // If a variable is not specified, place data values in local scope.

  source = "with(obj||{}){\n" + source + "}\n";
  source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n//# sourceURL=/microtemplates/source[" + counter++ + "]";

  try {
    render = new Function("obj", "escapeExpr", source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  if (data) return render(data, escapeExpr);

  var template = function (data) {
    return render.call(this, data, escapeExpr);
  }; // Provide the compiled function source as a convenience for precompilation.


  template.source = "function(" + ("obj") + "){\n" + source + "}";
  return template;
}

// Return the true type of value
function typeOf(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
function sanitizeHTML(string) {
  var temp = document.createElement("div");
  temp.textContent = string;
  return temp.innerHTML;
}
function uuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
const invalidChars = /[^a-zA-Z0-9:]+/g; // Return kebab-case

function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, match => match[0] + "-" + match[1]).replace(invalidChars, "-").toLowerCase();
} // Return camlCase

function camelCase(str) {
  return str.replace(/_/g, (_, index) => index === 0 ? _ : "-").replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => index === 0 ? letter.toLowerCase() : letter.toUpperCase()).replace(invalidChars, "");
} // Typecast attributes
function onChange(object, onChange) {
  const handler = {
    get(target, property, receiver) {
      const desc = Object.getOwnPropertyDescriptor(target, property);

      if (desc && !desc.writable && !desc.configurable) {
        return Reflect.get(target, property, receiver);
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

function html(parts, ...args) {
  const template = parts.reduce((acc, part, i) => {
    // if no string put in first part
    if (!acc.string) {
      return {
        events: acc.events,
        string: part
      };
    }

    const arg = args[i - 1];

    if (arg === null || arg === false) {
      return {
        events: acc.events,
        string: acc.string + part
      };
    }

    if (typeOf(arg) === "function") {
      const id = uuid();
      return {
        events: { ...acc.events,
          [id]: arg
        },
        string: acc.string + id + part
      };
    }

    if (typeOf(arg) === "array") {
      const allEvents = arg.reduce((acc, a) => {
        return { ...acc,
          ...a.events
        };
      }, {});
      const string = arg.reduce((acc, a) => acc + a.string, "");
      return {
        events: { ...acc.events,
          ...allEvents
        },
        string: acc.string + string + part
      };
    }

    if (typeOf(arg) === "object") {
      return {
        events: { ...acc.events,
          ...arg.events
        },
        string: acc.string + arg.string + part
      };
    }

    if (typeOf(arg) === "string") {
      const sanitizedHTML = sanitizeHTML(arg);
      return {
        events: { ...acc.events,
          ...arg.events
        },
        string: acc.string + sanitizedHTML + part
      };
    }

    return {
      events: { ...acc.events
      },
      string: acc.string + args[i - 1] + part
    };
  }, {
    events: {},
    string: null
  });
  return template;
}

let components = {};
let componentCount = 0;
let currentComponentId = 0; // export tagged template literal

const html$1 = html; // on mounted

function onMounted(callback) {
  const component = components[currentComponentId];
  if (component.isMounting) return callback();
  return;
} // on mounted

function onUnmounted(callback) {
  const component = components[currentComponentId];
  if (component.isUnmounting) return callback();
  return;
} // function to declare a property

function prop(name, value) {
  const component = components[currentComponentId];
  const camelName = camelCase(name);

  if (component.props[camelName] !== undefined) {
    return component.props[camelName];
  } else {
    component.props[camelName] = value;
    return component.props[camelName];
  }
} // function to declare a value

function value(val) {
  const component = components[currentComponentId];
  const valueCount = component.valuesCounter;
  const finalAmountofValues = component.finalAmountofValues;
  component.valuesCounter++;

  if (!finalAmountofValues) {
    component.values[valueCount] = onChange({
      value: val
    }, () => {
      if (component.this) {
        // TODO: Do some async magic here?
        setTimeout(() => {
          component.this.render();
        }, 0);
      }
    });
    return component.values[valueCount];
  }

  return component.values[valueCount % finalAmountofValues];
}
function Component(template) {
  // save a refernece to the component count
  const componentId = componentCount;
  currentComponentId = componentId; // initialize component with empty values

  components = { ...components,
    [componentId]: {
      this: null,
      props: {},
      values: [],
      valuesCounter: 0,
      finalAmountofValues: null,
      isMounting: false,
      isUnmounting: false
    }
  };
  componentCount++;
  template();
  components[componentId].finalAmountofValues = components[componentId].valuesCounter;

  class Element extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({
        mode: "open"
      });
      this._upradeProperty = this._upradeProperty.bind(this);
      this.html = html$1.bind(this);
      this.template = template.bind(this);
      components[componentId].this = this;
      this.render = this.render.bind(this);
    }

    static get observedAttributes() {
      Object.keys(components[componentId].props).forEach(propName => {
        Object.defineProperty(this.prototype, propName, {
          configurable: true,

          get() {
            return components[componentId].props[propName];
          },

          set(newVal) {
            components = { ...components,
              [componentId]: { ...components[componentId],
                props: { ...components[componentId].props,
                  [propName]: newVal
                }
              }
            };
            this.render();
          }

        });
      });
      return Object.keys(components[componentId].props).map(propName => {
        return kebabCase(propName);
      });
    }

    connectedCallback() {
      components[componentId].isMounting = true; // upgrade prop if it's already set by a framework for instance

      Object.keys(components[componentId].props).forEach(prop => {
        this._upradeProperty(prop);
      }); // render

      this.render();
      components[componentId].isMounting = false;
    }

    disconnectedCallback() {
      components[componentId].isUnmounting = true;
      this.render();
      components[componentId].isUnmounting = false;
    }

    attributeChangedCallback(attr, _, updatedVal) {
      const camelName = camelCase(attr);
      this[camelName] = updatedVal;
      components[componentId].props[camelName] = updatedVal;
    }

    _upradeProperty(prop) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }

    render() {
      currentComponentId = componentId;
      const template = this.template();
      const innerHTML = typeof template === "string" ? template : template.string;
      const test = tmpl(`<div><%= data %></div>`);
      console.log(test({
        data: ["halla", "hei"]
      }));
      emerj.merge(this._shadowRoot, innerHTML, {}, template.events);
    }

  }

  return Element;
}
/*
export default function Customel({
  mode = "open",
  props = {},
  state = {},
  actions = {},
  mounted = () => {},
  updated = () => {},
  propChanged = () => {},
  stateChanged = () => {},
  template = () => {},
  styles = () => ""
}) {
  class Component extends HTMLElement {
    constructor() {
      super();

      // props
      this.props = { ...props };
      this._propTypes = {};
      this._initProps = this._initProps.bind(this);
      this.propChanged = propChanged.bind(this);
      this._initProps();

      // state
      this.state = { ...state };
      this.setState = this.setState.bind(this);
      this.stateChanged = stateChanged.bind(this);

      // styles
      this._styles = styles.bind(this);

      // actions
      this.actions = { ...actions };
      this._initActions = this._initActions.bind(this);
      this._initActions();

      // temaplte
      this._shadowRoot = this.attachShadow({ mode });
      this._html = html.bind(this);
      this._template = template.bind(this);
      this.render = this.render.bind(this);

      // mounted
      this.mounted = mounted.bind(this);

      // updated
      this.updated = updated.bind(this);

      // emit
      this.emit = this.emit.bind(this);
    }

    _initProps() {
      Object.keys(this.props).map(p => {
        // set the proptype
        const type = typeOf(this.props[p]);
        this._propTypes[p] = type;

        // either get value from attrs, or from default prop
        const value =
          this.getAttribute(p) || this.hasAttribute(p) || this.props[p];
        this.props[p] = typeCast(value, type);
      });
    }

    _initActions() {
      // bind actions
      Object.keys(this.actions).map(a => {
        this.actions[a] = actions[a].bind(this);
      });
    }

    _upradeProperty(prop) {
      // Don't really know why we do this, but must be done to
      // update data if a property initially was set by a framework like Vue/React
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }

    static get observedAttributes() {
      // make sure property changes reflect attributes
      Object.keys(props).forEach(prop => {
        // define a get and set for each prop on the prototype
        Object.defineProperty(this.prototype, prop, {
          configurable: true,
          get() {
            return this.props[prop];
          },
          set(newVal) {
            // TODO: Do a deep compare to avoid rerender on equal objects and arrays
            const oldVal = this.props[prop];
            const propType = this._propTypes[prop];

            // only rerender and set attriutes if value is new
            if (newVal !== oldVal) {
              // set the new value
              this.props[prop] = newVal;
              // rerender and notify about the change
              this.render();
              this.propChanged(prop, oldVal, newVal);
            }

            // only reflect attr if type is primitive
            if (typeof newVal !== "object") {
              const attr = kebabCase(prop);
              // set attributes and attributeChangedCallback will rerender for us
              if (newVal === (null || false)) {
                this.removeAttribute(attr);
              } else if (newVal === true) {
                this.setAttribute(attr, "");
              } else if (propType === "string" && newVal === "") {
                this.removeAttribute(attr);
              } else {
                this.setAttribute(attr, newVal);
              }
            }
          }
        });
      });

      return Object.keys(props).map(propName => {
        return kebabCase(propName);
      });
    }

    connectedCallback() {
      // upgrade prop if it's already set by a framework for instance
      Object.keys(this.props).forEach(prop => {
        this._upradeProperty(prop);
      });

      // render
      this.render();

      // fire mounted hook
      this.mounted();
    }

    attributeChangedCallback(attr, _, updatedVal) {
      const propName = camelCase(attr);
      const oldVal = this.props[propName];
      const newVal = typeCast(
        updatedVal || this.hasAttribute(attr),
        this._propTypes[propName]
      );

      if (oldVal !== newVal) {
        // set new value – triggers the setter
        this[propName] = newVal;
      }
    }

    render() {
      const template = this._template(this._html);
      const innerHTML =
        typeof template === "string" ? template : template.string;
      const result = this._html`<style>${this._styles()}</style>${innerHTML}`;
      emerj.merge(this._shadowRoot, result.string, {}, template.events);
      this.updated();
    }

    setState(newState) {
      const oldState = this.state;
      this.state = { ...oldState, ...newState };
      this.stateChanged({ ...oldState }, { ...this.state });
      this.render();
    }

    emit(name, data) {
      this.dispatchEvent(
        new CustomEvent(name, { detail: data, bubbles: false })
      );
    }
  }
  return Component;

}

*/

export { html$1 as html, onMounted, onUnmounted, prop, value, Component };
