const customel = require("../dist/index.js");

test("renders when created via constructor", async () => {
  const rendered = `hello world`;
  console.log(document);
  window.document.customElements.define(
    "my-element",
    customel({
      template: function(html) {
        return html`
          <div>Halla</div>
        `;
      }
    })
  );

  const element = document.createElement("my-element");
  document.body.appendChild(element);
  const mountedEl = document.querySelector("my-element");
  console.log(mountedEl);
  assert.equal(mountedEl.innerHTML, "Halla");
});
