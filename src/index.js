import emerj from "./emerj.js";
import {
  typeOf,
  kebabCase,
  camelCase,
  applyAttr,
  typeCast,
  onChange
} from "./utils.js";
import { html } from "./html.js";
import { css } from "./css.js";

export { html };
export { css };

export function Component({
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
      super();

      // props
      this.props = { ...props };
      this._propTypes = {};
      this._initProps = this._initProps.bind(this);
      this.propChanged = propChanged.bind(this);
      this._initProps();

      // state
      this.state = { ...state };
      this._initState = this._initState.bind(this);
      this._initState();

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

    _initState() {
      this.state = onChange(this.state, () => {
        setTimeout(() => {
          this.render();
        }, 0);
      });
    }

    _initActions() {
      const data = {
        state: this.state,
        actions: this.actions,
        props: this.props
      };
      // bind actions
      Object.keys(this.actions).map(a => {
        const boundAction = actions[a].bind(this);
        function actionWithData(params) {
          if (!params) return boundAction(data);
          else return boundAction(params, data);
        }
        this.actions[a] = actionWithData;
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
          set(val) {
            // TODO: Do a deep compare to avoid rerender on equal objects and arrays
            const attr = kebabCase(prop);
            const oldVal = this.props[prop];
            const propType = this._propTypes[prop];

            const newVal = typeCast(val || this.hasAttribute(attr), propType);

            // only rerender and set attriutes if value is new
            if (newVal !== oldVal) {
              // set the new value
              this.props[prop] = newVal;
              // rerender and notify about the change
              this.render();
              this.propChanged(prop, oldVal, newVal);
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

    attributeChangedCallback(attr, oldVal, updatedVal) {
      const propName = camelCase(attr);
      const hasProp = this.props[propName] ? true : false;
      const oldPropValue = this.props[propName];
      const propType = this._propTypes[propName] || null;

      if (hasProp) {
        const newPropValue = typeCast(
          updatedVal || this.hasAttribute(attr),
          propType
        );

        if (oldPropValue !== newPropValue) {
          this[propName] = newPropValue;
          // only reflect attr if type is primitive
          if (typeof newPropValue !== "object") {
            applyAttr(this, attr, newPropValue);
          }
        }
      } else {
        if (oldVal !== updatedVal) {
          applyAttr(this, attr, updatedVal);
        }
      }
    }

    render() {
      const data = {
        actions: this.actions,
        props: this.props,
        state: this.state
      };

      const template = this._template(data);
      const innerHTML =
        typeof template === "string" ? template : template.string;
      const result = this._html`<style>${this._styles(
        data
      )}</style>${innerHTML}`;
      emerj.merge(this._shadowRoot, result.string, {}, template.events);
      this.updated();
    }
  }
  return Component;
}
