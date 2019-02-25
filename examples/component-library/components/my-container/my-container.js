import MyComponent from "../../../../index.js";
import getStyles from "./styles.js";

new MyComponent({
  tag: "my-container",
  props: {
    wide: false,
    narrow: false
  },
  styles() {
    return getStyles(this.props);
  },
  render: function(html) {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
});
