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

      }
    `;
  },
  render: function(html) {
    const { items } = this.props;

    return html`
      <div>
        ${items.map(
          item => html`
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
