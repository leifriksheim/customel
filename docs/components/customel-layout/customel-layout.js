import MyComponent from "../../../dist/index.es.js";

new MyComponent({
  tag: "customel-layout",
  mode: "open",
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

      }
      ::slotted(div) {
        margin-left: 500px;
      }
    `;
  },
  render: function(html) {
    return html`
      <div class="layout">
        <slot class="sidebar" name="sidebar"></slot>
        <slot></slot>
      </div>
    `;
  }
});
