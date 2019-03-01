import Customel from "../../dist/index.es.js";

new Customel({
  tag: "my-accordion",
  props: {
    items: [{ title: "Initial", content: "Initial" }]
  },
  styles() {
    return `
      div {
        display: block;
        font-family: "Arial";
        border: 1px solid #eee;
        box-shadow: 0px 4px 4px 0px rgba(0,0,0,0.1);
      }
      details {
        border-bottom: 1px solid #eee;
      }
      summary {
        position: relative;
        font-weight: bold;
        cursor: pointer;
        outline: 0;
        padding: 10px;
      }
      summary:hover {
        background: #eee;
      }
      p {
        padding: 10px;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary:before {
        content: "";
        display: block;
        position: absolute;
        right: 15px;
        top: 15px;
        width: 10px;
        height: 10px;
        border-left: 1px solid black;
        border-top: 1px solid black;
        transform: rotate(-135deg);
        transform-origin: 50% 50%;
      }
      details[open] summary:before {
        transform: rotate(45deg);

      }
    `;
  },
  actions: {
    showAlert() {
      alert("halla");
    }
  },
  render: function(html) {
    const { items } = this.props;

    return html`
      <div>
        ${items.map(
          (item, index) => html`
            <details>
              <summary>
                ${item.title}
              </summary>
              <p>
                ${item.content}
              </p>
            </details>
          `
        )}
      </div>
    `;
  }
});
