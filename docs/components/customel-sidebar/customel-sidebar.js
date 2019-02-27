import MyComponent from "../../../dist/index.es.js";
import getStyles from "./styles.js";

new MyComponent({
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
