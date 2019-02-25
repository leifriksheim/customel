import MyComponent from "../../../../index.js";
import { carouselStyles } from "./styles.js";

new MyComponent({
  tag: "my-carousel",
  styles() {
    return carouselStyles(this.props);
  },
  render: function(html) {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
});
