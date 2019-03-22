import Customel from "//unpkg.com/customel?module";

function qa(s, pos = document) {
  return [...pos.querySelectorAll(s)];
}

function getTextArray(nodes) {
  return nodes.map(node => node.textContent);
}

function template(html, context) {}

new Customel({
  tag: "customel-toc",
  props: {
    node: []
  },
  state: {
    toc: []
  },
  styles() {
    return `
      nav {
        display: flex;
        flex-direction: column;
      }
      a {
        text-decoration: none;
        underline: none;
        color: black;
        margin-bottom: 10px;
        opacity: 0.6;
      }
      a:hover {
        color: black;
        opacity: 1;
        transform: translateX(0px);
        transition: all 0.2s ease;
      }
      a[active=true] {
        opacity: 1;
        font-weight: bold;
        transform: translateX(10px);
      }
      a[active=true]:before {
        content: "";
        display: block;
        width: 5px;
        height: 5px;
        background: black;
        border-radius: 100%;
        position: absolute;
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
      }
      .H1 {
        opacity: 1;
      }
      .H2 {
        margin-left: 10px;
        margin-top: 10px;
      }
      .H3 {
        margin-left: 20px;
        font-size: 0.85em;

      }
      .H4 {
        margin-left: 30px;
        font-size: 0.85em;
      }
    `;
  },
  render: function(html) {
    const { toc } = this.state;
    const { setActive } = this.actions;

    return html`
      <nav>
        ${toc.map(
          heading => html`
            <a
              active=${heading.active}
              class=${heading.class}
              href=${heading.href}
              >${heading.text}</a
            >
          `
        )}
      </nav>
    `;
  },
  mounted() {
    this.actions.generateToc(this.props.node);
    window.addEventListener("hashchange", this.actions.handleHashChange);
    window.addEventListener("scroll", this.actions.handleScroll);
  },
  actions: {
    generateToc(node) {
      const headings = qa("h1, h2, h3, h4", node);
      const toc = headings.map(node => {
        return {
          text: node.textContent,
          href: "#" + node.id,
          id: node.id,
          class: node.tagName,
          active: false
        };
      });
      this.setState({ toc });
    },
    handleHashChange(e) {
      const hash = e.target.location.hash;
      const newToc = this.state.toc.map(heading => {
        return heading.href === hash
          ? { ...heading, active: true }
          : { ...heading, active: false };
      });
      this.setState({ toc: newToc });
    },
    handleScroll(e) {}
  }
});
