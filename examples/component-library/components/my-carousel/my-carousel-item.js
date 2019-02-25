import MyComponent from "../../../../index.js";
import { carouselItemStyles } from "./styles.js";

new MyComponent({
  tag: "my-carousel-item",
  styles() {
    return carouselItemStyles(this.props);
  },
  render: function(html) {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
});
