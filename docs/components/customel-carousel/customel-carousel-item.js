import Customel from "//unpkg.com/customel?module";
import { carouselItemStyles } from "./styles.js";

new Customel({
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
