![Customel](media/logo.png)

<p align="center">
<a href="https://www.npmjs.com/package/customel"><img src="https://img.shields.io/npm/v/customel.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/customel"><img src="https://img.shields.io/npm/l/customel.svg" alt="License"></a>
</p>

```
Customel is under development. Don't use in production yet.
```

> A tiny wrapper function to simplify the creation of Custom Elements/Web Components.

- **Lightweight 🕊️** Customel is a small wrapper around the HTMLElement Class, and consists of around 180 LOC.
- **Intuitive 💡** Create custom elements with familiar concepts borrowed from UI-libraries like React and Vue.
- **Fast rendering ⚡️** Customel uses lighterhtml as the rendering engine for fast DOM-updates.
- **Integrates with frameworks 💬** Create a pattern library with Customel, and use them with your favourite framework.

## Installation

You can use Customel as a `<script>` tag from a [CDN](https://unkpg.com/customel@latest), or as a `customel` package on [npm](https://www.npmjs.com/customel).

## Documentation

To create a new element – initiate a new Customel:

```javascript
// my-element.js

new Customel({
  tag: "my-element",
  render: function(html) {
    return html`
      <div>My new element!</div>
    `;
  }
});
```

The Component will automatically get registered as a Custom Element:

```html
<!--  index.html --->
<html>
  <head>
    <script src="https://unkpg.com/customel"></script>
    <script src="my-element.js"></script>
  </head>
  <body>
    <my-element></my-element>
  </body>
</html>
```

## API

## State

Your state is contained in a state object.
Modify the state with `this.setSate` like in React.
`this.setState` will cause a rerender and you will get a fresh DOM with updated data.

```javascript
new Customel({
  tag: "my-element",
  state: {
    active: false
  },
  render: function(html) {
    return html`
      <button onclick=${() => this.setState({ active: true })}>
        Active state is ${this.state.active}
      </button>
    `;
  }
});
```

## Styles

You can return regular CSS in the styles function.

```javascript
new Customel({
  tag: "my-element",
  state: {
    active: false
  },
  styles() {
    return `
      button {
        background-color: ${this.state.active ? "black" : "white"};
        color: ${this.state.active ? "white" : "black"};
      }
    `;
  },
  render: function(html) {
    return html`
      <button onclick=${() => this.setState({ active: true })}>
        My button
      </button>
    `;
  }
});
```

## Props

Most likely you want to be able to control your component from the outside.
This is achieved throught props:

```javascript
new Customel({
  tag: "my-element",
  props: {
    open: false
  },
  render: function(html) {
    return html`
      <div>
        <h1>Accordion title</h1>
        ${this.props.open
          ? html`
              <p>Accordion content</p>
            `
          : null}
      </div>
    `;
  }
});
```

This makes attributes available on your component.

```html
<my-accordion open="true"></my-accordion>

<script>

  const accordion = document.querySelector('my-accordion');

  accordion.addEventListener('click' => {
    accordion.setAttribute('open', false);
  })
</script>
```

### Passing down objects or arrays

If you want to pass down rich data like objects or arrays as props you need to change the property, and not the attribute on the component, as specified in "Web Components Everywhere".

```html
<my-accordion></my-accordion>

<script>
  const accordion = document.querySelector("my-accordion");
  accordion.items = [{ title: "My title", content: "My content" }];
</script>
```

See examples on how to do this in Vue/Angular/React.

## Actions

```javascript
new Customel({
  tag: "my-element",
  actions {
    showMessage() {
      alert('My message!');
    }
  },
  render: function(html) {
    return html`
      <button onclick=${() => this.actions.showMessage()}>
        My button
      </button>
    `;
  }
});
```

Customel is [MIT licensed](./LICENSE).
