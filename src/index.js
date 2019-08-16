import emerj from "./emerj.js";
import tmpl from "./tmpl.js";
import { onChange, kebabCase, camelCase } from "./utils.js";

import { html as htmlTemplateLiteral } from "./html.js";

let components = {};
let componentCount = 0;
let currentComponentId = 0;

// export tagged template literal
export const html = htmlTemplateLiteral;

// on mounted
export function onMounted(callback) {
  const component = components[currentComponentId];

  if (component.isMounting) return callback();

  return;
}

// on mounted
export function onUnmounted(callback) {
  const component = components[currentComponentId];

  if (component.isUnmounting) return callback();

  return;
}

// function to declare a property
export function prop(name, value) {
  const component = components[currentComponentId];

  const camelName = camelCase(name);

  if (component.props[camelName] !== undefined) {
    return component.props[camelName];
  } else {
    component.props[camelName] = value;
    return component.props[camelName];
  }
}

// function to declare a value
export function value(val) {
  const component = components[currentComponentId];
  const valueCount = component.valuesCounter;
  const finalAmountofValues = component.finalAmountofValues;

  component.valuesCounter++;

  if (!finalAmountofValues) {
    component.values[valueCount] = onChange({ value: val }, () => {
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

export function Component(template) {
  // save a refernece to the component count
  const componentId = componentCount;
  currentComponentId = componentId;

  // initialize component with empty values
  components = {
    ...components,
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

  components[componentId].finalAmountofValues =
    components[componentId].valuesCounter;

  class Element extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._upradeProperty = this._upradeProperty.bind(this);

      this.html = html.bind(this);

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
            components = {
              ...components,
              [componentId]: {
                ...components[componentId],
                props: { ...components[componentId].props, [propName]: newVal }
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
      components[componentId].isMounting = true;
      // upgrade prop if it's already set by a framework for instance
      Object.keys(components[componentId].props).forEach(prop => {
        this._upradeProperty(prop);
      });
      // render
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
      const innerHTML =
        typeof template === "string" ? template : template.string;
      const test = tmpl(`<div><%= data %></div>`);
      console.log(test({ data: ["halla", "hei"] }));
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
