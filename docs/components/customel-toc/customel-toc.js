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
        padding-bottom: 10px;
        color: #c4c4c4;
      }
      a:hover {
        color: black;
      }
      a[active=true] {
        color: black;
      }
      .H1 {

      }
      .H2 {
        padding-left: 10px;
        padding-top: 10px;
      }
      .H3 {
        padding-left: 20px;
        font-size: 0.8em;
      }
      .H4 {
        padding-left: 30px;
        font-size: 0.8em;
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
