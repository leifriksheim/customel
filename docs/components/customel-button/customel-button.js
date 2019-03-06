import Customel from "//unpkg.com/customel?module";
import getStyles from "./styles.js";

new Customel({
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
