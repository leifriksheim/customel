import MyComponent from "../../../dist/index.es.js";
import { carouselItemStyles } from "./styles.js";

new MyComponent({
  tag: "customel-carousel-item",
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
