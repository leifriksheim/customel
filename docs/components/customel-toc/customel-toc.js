import CustomEl from "../../../dist/index.es.js";

new CustomEl({
  tag: "customel-toc",
  styles() {
    return `
      nav {
        display: flex;
        flex-direction: column;
      }
    `;
  },
  render: function(html) {
    return html`
      <nav>
        <slot></slot>
      </nav>
    `;
  }
});
