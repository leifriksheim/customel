import { Component, html, css } from "../dist/index.es.js";

customElements.define(
  "special-button",
  Component({
    props: {
      disabled: false,
      hello: "hi"
    },
    actions: {
      handleClick() {
        this.dispatchEvent(
          new CustomEvent("cat", {
            detail: {
              hazcheeseburger: true
            }
          })
        );
      }
    },
    template: ({ props, actions }) => {
      return html`
        <button
          onclick="${actions.handleClick}"
          class="${props.hello}"
          disabled="${props.disabled}"
        >
          <slot></slot>
        </button>
      `;
    }
  })
);

customElements.define(
  "my-element",
  Component({
    state: {
      todos: ["Todo 1", "Todo 2"],
      value: ""
    },
    actions: {
      handleInput(e, { state }) {
        state.value = e.target.value;
      },
      handleKeyDown(e, { actions }) {
        if (e.keyCode === 13) actions.addTodo(e);
      },
      addTodo(e, { state }) {
        state.todos.push(state.value);
        state.value = "";
      }
    },
    template: ({ state, actions }) =>
      html`
        <h1>Add todo</h1>
        <input
          value="${state.value}"
          onkeypress="${actions.handleKeyDown}"
          oninput="${actions.handleInput}"
        />
        <special-button oncat="${actions.addTodo}" disabled="${!state.value}"
          >Hello button</special-button
        >
        <button disabled="${!state.value}" onclick="${actions.addTodo}">
          Add
        </button>
        <ul>
          ${state.todos.map(
            todo =>
              html`
                <li>${todo}</li>
              `
          )}
        </ul>
      `,
    styles: ({ state }) => css`
      * {
        box-sizing: border-box;
        font-family: sans-serif;
      }
      :host {
        box-sizing: border-box;
        max-width: 400px;
        margin: 0 auto;
        display: block;
      }
      h1 {
        text-align: center;
      }
      input {
        display: block;
        font-size: 16px;
        font-family: sans-serif;
        margin-bottom: 10px;
        width: 100%;
        padding: 10px 20px;
      }
      button {
        font-size: 16px;
        background: ${state.value ? "blue" : "lightgray"};
        color: white;
        width: 100%;
        display: block;
        padding: 10px 20px;
      }
    `
  })
);
