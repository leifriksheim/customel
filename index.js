import { html, render as lighterRender } from "lighterhtml";

export default function Component({
  tag = "my-element",
  mode = "closed",
  props = {},
  state = {},
  actions = {},
  mounted = () => {},
  propChanged = () => {},
  render = () => {},
  styles = () => ""
}) {
  class MyComponent extends HTMLElement {
    constructor() {
      super();

      // props
      this.props = props;
      this.propTypes = {};
      this._initProps = this._initProps.bind(this);
      this.propChanged = propChanged.bind(this);
      this._initProps();

      // state
      this.state = state;
      this.setState = this.setState.bind(this);

      // styles
      this.styles = styles.bind(this);

      // actions
      this.actions = actions;
      this._initActions = this._initActions.bind(this);
      this._initActions();

      // render
      this.engine = html.bind(this);
      this.html = render.bind(this);
      this.render = lighterRender.bind(
        this,
        this.attachShadow({ mode: mode }),
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
        this.propTypes[p] = type;

        // either get value from attrs, or from default prop
        const value =
          this.getAttribute(p) || this.hasAttribute(p) || this.props[p];
        this.props[p] = typeCast(value, type, p);
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
            this.props[prop] = newVal;

            if (typeof newVal === "object") {
              // rerender if property is rich data
              this.render();
            } else {
              // set attributes and attributeChangedCallback will rerender for us
              if (newVal === null) {
                this.removeAttribute(prop);
              } else {
                this.setAttribute(prop, newVal);
              }
            }
            // notify component
            this.propChanged(prop, oldVal, newVal);
          }
        });
      });

      return Object.keys(props);
    }

    connectedCallback() {
      // upgrade prop if it's already set by a framework for instance
      Object.keys(this.props).forEach(prop => {
        this._upradeProperty(prop, this.prototype);
      });

      // render
      this.render();
      // fire mounted hook
      this.mounted();
    }

    attributeChangedCallback(attr, _, updatedVal) {
      const type = this.propTypes[attr];
      const oldVal = this.props[attr];
      const newVal = typeCast(
        updatedVal || this.hasAttribute(attr),
        type,
        attr
      );

      if (oldVal !== newVal) {
        this.props[attr] = newVal;
        this.render();
        // notify component
        this.propChanged(attr, oldVal, newVal);
      }
    }

    render() {
      return this.engine`
        <style>
        ${this.styles()}
        </style>
        ${this.html(this.engine)}
      `;
    }

    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.render();
    }

    emit(name, data) {
      this.dispatchEvent(new CustomEvent(name, { detail: data }));
    }
  }

  customElements.define(tag, MyComponent);

  return MyComponent;
}

function typeCast(value, type, attr) {
  const actualType = typeOf(value);

  if (type === "boolean") {
    if (value === "true" || "false") {
      return value === "true" || "" ? true : false;
    }
    if (actualType !== "boolean") {
      console.error(`Property "${attr}" with value ${value} is not a boolean.`);
    }
    return value;
  }

  if (type === "number") {
    return parseInt(value);
  }

  if (type === "string") {
    return String(value);
  }

  return value;

  console.error(
    `Attributes can only be primitives. "${attr}" with value ${value} is not a primitive.`
  );
}

function typeOf(value) {
  return Object.prototype.toString
    .call(value)
    .slice(8, -1)
    .toLowerCase();
}
