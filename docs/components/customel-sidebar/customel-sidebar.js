import Customel from "//unpkg.com/customel?module";
import getStyles from "./styles.js";

new Customel({
  tag: "customel-sidebar",
  props: {
    wide: false,
    narrow: false
  },
  render: function(html) {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
});
