import Customel from "//unpkg.com/customel?module";
import { carouselStyles } from "./styles.js";

new Customel({
  tag: "customel-carousel",
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
