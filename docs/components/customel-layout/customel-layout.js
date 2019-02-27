import MyComponent from "../../../dist/index.es.js";

new MyComponent({
  tag: "customel-layout",
  styles() {
    return `
      ::slotted(aside) {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: 500px;
        padding: 40px;
        padding-left: 300px;
        border-right: 1px solid #eee;
      }
      ::slotted(div) {
        margin-left: 500px;
        padding: 40px;
      }
    `;
  },
  render: function(html) {
    return html`
      <div>
        <slot name="sidebar"></slot>
        <slot></slot>
      </div>
    `;
  }
});
