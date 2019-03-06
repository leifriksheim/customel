import Customel from "../../index_without_lighter.js";

new Customel({
  tag: "my-accordion",
  props: {
    items: [{ title: "Initial", content: "Initial" }]
  },
  state: {
    todo: "",
    todos: ["Hello"]
  },
  events: {
    input: {
      input(e) {
        this.setState({ todo: e.target.value });
      }
    },
    button: {
      click() {
        this.setState();
      }
    }
  },
  render() {
    const { todos, todo } = this.state;

    return `
      <div>

      <input value="${todo}" />

      <ul>
      ${todos.map(
        todo => `
      <li>${todo}</li>
      `
      )}
      </ul>

      </div>
    `;
  }
});
