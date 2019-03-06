import Customel from "//unpkg.com/customel?module";
import getStyles from "./styles.js";

new Customel({
  tag: "customel-block",
  props: {
    p: 0,
    py: 0,
    px: 0,
    pl: 0,
    pr: 0,
    pt: 0,
    pb: 0,
    m: 0,
    my: 0,
    mx: 0,
    ml: 0,
    mr: 0,
    mt: 0,
    mb: 0,
    backgroundColor: "#fff",
    textAlign: "left",
    justifyContent: "auto",
    alignItems: "auto"
  },
  styles() {
    return getStyles(this.props);
  },
  render: function(html) {
    return html`
      <div class="my-block">
        <slot></slot>
      </div>
    `;
  }
});
