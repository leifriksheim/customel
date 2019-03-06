import Customel from "//unpkg.com/customel?module";

new Customel({
  tag: "customel-container",
  mode: "open",
  props: {
    wide: false,
    narrow: false,
    left: false
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

function getWidth(props) {
  if (props.wide) return 1200;
  if (props.narrow) return 600;
  return 800;
}

function getStyles(props) {
  return `
    div {
      display: block;
      ${props.left ? "" : "margin: 0 auto;"}
      width: 100%;
      max-width: ${getWidth(props)}px;
    }
  `;
}
