import MyComponent from "../../../dist/index.es.js";

new MyComponent({
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
