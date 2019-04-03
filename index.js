import { html, render as lighterRender } from "lighterhtml";

export default function Component({
  tag = "my-element",
  mode = "closed",
  props = {},
  shadow = true,
  autoDefine = true,
  state = {},
  actions = {},
  mounted = () => {},
  propChanged = () => {},
  stateChanged = () => {},
  render = () => {},
  styles = () => ""
}) {
  class Customel extends HTMLElement {
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

      // render
      this._engine = html.bind(this);
      this._html = render.bind(this);
      this.render = lighterRender.bind(
        this,
        shadow ? this.attachShadow({ mode: mode }) : this,
        this.render
      );

      // mounted
      this.mounted = mounted.bind(this);

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

            // only rerender and set attriutes if value is new
            if (newVal !== oldVal) {
              // set the new value
              this.props[prop] = newVal;
              // rerender and notify about the change
              this.render();
              this.propChanged(prop, oldVal, newVal);
            }

            // if value is any type of object, don't reflect attributes
            if (typeof newVal !== "object") {
              const attr = camelCase(prop);
              // set attributes and attributeChangedCallback will rerender for us
              if (newVal === (null || false)) {
                this.removeAttribute(attr);
              } else if (newVal === true) {
                this.setAttribute(attr, "");
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
      return this._engine`
        <style>
        ${this._styles()}
        </style>
        ${this._html(this._engine)}
      `;
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

  if (autoDefine) {
    customElements.define(tag, Customel);
  }

  return Customel;
}

// Typecast a value
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

// Return the true type of value
function typeOf(value) {
  return Object.prototype.toString
    .call(value)
    .slice(8, -1)
    .toLowerCase();
}

const invalidChars = /[^a-zA-Z0-9:]+/g;

// Return kebab-case
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, match => match[0] + "-" + match[1])
    .replace(invalidChars, "-")
    .toLowerCase();
}

// Return camlCase
function camelCase(str) {
  return str
    .replace(/_/g, (_, index) => (index === 0 ? _ : "-"))
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(invalidChars, "");
}
