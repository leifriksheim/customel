import Customel from "//unpkg.com/customel?module";

new Customel({
  tag: "customel-link",
  props: {
    to: "#"
  },
  styles() {
    return `
      a {
        text-decoration: none;
        color: #c4c4c4;
      }
      a:hover {
        color: #000;
      }
    `;
  },
  render: function(html) {
    return html`
      <a href=${this.props.to}>
        <slot></slot>
      </a>
    `;
  }
});
