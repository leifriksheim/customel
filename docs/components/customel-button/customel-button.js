import MyComponent from "../../../dist/index.es.js";
import getStyles from "./styles.js";

new MyComponent({
  tag: "customel-button",
  props: {
    full: false,
    primary: false
  },
  styles() {
    return getStyles(this.props);
  },
  render: function(html) {
    return html`
      <button>
        <slot></slot>
      </button>
    `;
  }
});
