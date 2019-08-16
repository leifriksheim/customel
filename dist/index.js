var customel = (function (exports) {
  'use strict';

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
            if (attr.startsWith("on")) {
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

      if (typeof modified === "string") {
        const html = modified;
        modified = document.createElement("div");
        modified.innerHTML = html;
      } // Naively recurse into the children, if any, replacing or updating new
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
              baseNode[attr] = attr.startsWith("on") ? events[attrs.new[attr]] : attrs.new[attr];
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

  // Return the true type of value
  function typeOf(value) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
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

  function typeCast(value, type) {
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
        // hash the function string to make an id
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

  function Component({
    mode = "open",
    props = {},
    state = {},
    actions = {},
    mounted = () => {},
    updated = () => {},
    propChanged = () => {},
    template = () => {},
    styles = () => ""
  }) {
    class Component extends HTMLElement {
      constructor() {
        super(); // props

        this.props = { ...props
        };
        this._propTypes = {};
        this._initProps = this._initProps.bind(this);
        this.propChanged = propChanged.bind(this);

        this._initProps(); // state


        this.state = { ...state
        };
        this._initState = this._initState.bind(this);

        this._initState(); // styles


        this._styles = styles.bind(this); // actions

        this.actions = { ...actions
        };
        this._initActions = this._initActions.bind(this);

        this._initActions(); // temaplte


        this._shadowRoot = this.attachShadow({
          mode
        });
        this._html = html.bind(this);
        this._template = template.bind(this);
        this.render = this.render.bind(this); // mounted

        this.mounted = mounted.bind(this); // updated

        this.updated = updated.bind(this); // emit

        this.emit = this.emit.bind(this);
      }

      _initProps() {
        Object.keys(this.props).map(p => {
          // set the proptype
          const type = typeOf(this.props[p]);
          this._propTypes[p] = type; // either get value from attrs, or from default prop

          const value = this.getAttribute(p) || this.hasAttribute(p) || this.props[p];
          this.props[p] = typeCast(value, type);
        });
      }

      _initState() {
        this.state = onChange(this.state, () => {
          setTimeout(() => {
            this.render();
          }, 0);
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
              const propType = this._propTypes[prop]; // only rerender and set attriutes if value is new

              if (newVal !== oldVal) {
                // set the new value
                this.props[prop] = newVal; // rerender and notify about the change

                this.render();
                this.propChanged(prop, oldVal, newVal);
              } // only reflect attr if type is primitive


              if (typeof newVal !== "object") {
                const attr = kebabCase(prop); // set attributes and attributeChangedCallback will rerender for us

                if (newVal === (false)) {
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
        }); // render

        this.render(); // fire mounted hook

        this.mounted();
      }

      attributeChangedCallback(attr, _, updatedVal) {
        const propName = camelCase(attr);
        const oldVal = this.props[propName];
        const newVal = typeCast(updatedVal || this.hasAttribute(attr), this._propTypes[propName]);

        if (oldVal !== newVal) {
          // set new value – triggers the setter
          this[propName] = newVal;
        }
      }

      render() {
        const template = this._template({
          actions: this.actions,
          props: this.props,
          state: this.state
        });

        const innerHTML = typeof template === "string" ? template : template.string;
        const result = this._html`<style>${this._styles()}</style>${innerHTML}`;
        emerj.merge(this._shadowRoot, result.string, {}, template.events);
        this.updated();
      }

      emit(name, data) {
        this.dispatchEvent(new CustomEvent(name, {
          detail: data,
          bubbles: false
        }));
      }

    }

    return Component;
  }

  exports.html = html;
  exports.Component = Component;

  return exports;

}({}));
