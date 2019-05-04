![Customel](/media/logo.png)

<p align="center">
<a href="https://www.npmjs.com/package/customel"><img src="https://img.shields.io/npm/v/customel.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/customel"><img src="https://img.shields.io/npm/l/customel.svg" alt="License"></a>
</p>

```
Customel is just an experiment at the moment. Don't use in production.
```

> A tiny wrapper function to simplify the creation of Custom Elements/Web Components.

- **Lightweight 🕊️** Customel is a small wrapper around the HTMLElement Class, and consists of around 180 LOC.
- **Intuitive 💡** Create custom elements with familiar concepts borrowed from UI-libraries like React and Vue.
- **Fast rendering ⚡️** Customel uses [lighterhtml](https://github.com/WebReflection/lighterhtml) as the rendering engine for fast DOM-updates.
- **Integrates with frameworks 💬** Create a pattern library with Customel, and use them with your favourite framework.

## Introduction

Custom elements are awesome. They make it possible for everybody to use your components, no matter which new javascript framework they are using. As a part of the native web platform they are a great way to build maintainable and long lasting UI-libraries.

Still, writing custom elements from scratch can require quite a lot of boiler plate. Customel is a small wrapper around the api that reduces a lot of the boiler plate, enforces some best practises, and makes it easier to make new custom elements.

Customel is not meant to be a way to build software or large applications. It is built as a way to create small, reusable custom elements.

## Installation

### CDN

Create an index.html file and include Customel with the CDN:

```html
<script src="https://unpkg.com/customel"></script>
```

If you are using native ES Modules, you can include it in the index.html like this:

```html
<script type="module">
  import Customel from "//unpkg.com/customel?module";
</script>
```

### NPM

```
npm install customel
```

## Getting started

The easiest way to try out Customel is using the [JSFiddle Hello World example](https://jsfiddle.net/waysofperception/zp2rd7s5/8/). You can follow the Quick Start from here.

To create a custom element – initiate a new Customel:

```js
// my-element.js
import Customel from "//unpkg.com/customel?module";

new Customel({
  define: true,
  tag: "my-element",
  render: function(html) {
    return html`
      <div>Hello my new element!</div>
    `;
  }
});
```

Import it in a html file, and your custom element is ready to use:

```html
<!--  index.html --->
<html>
  <head>
    <script type="module" src="my-element.js"></script>
  </head>
  <body>
    <my-element></my-element>
  </body>
</html>
```

## API

### Define

If you set `define` to `true` it will immediately register the component in the custom elements registery, and it will be available in the DOM right away.

If define is false (as it is by default), then you must manually register it like this

```js
const Component = new Customel({
  define: true
  tag: "my-element"
});

customElements.define('my-component', Component)

```

### Tag

The tag will be your component name.
Custom Elements require a dash in the name, to distinguish it from a native HTML element:

```js
new Customel({
  define: true
  tag: "my-element"
});
```

You can then use it on your html page with the name you gave it:

```html
<my-element></my-element>
```

### Render

You probably want to render some html inside your custom element.
The render property returns a `html` function that we can use to display what we want.
The `html` function is a tagged template that allows you to write regular HTML with template literals for fast DOM-updates without a Virtual DOM. Read more about [lighterhtml](https://github.com/WebReflection/lighterhtml) and how to use it, if you want to know more.

```js
new Customel({
  define: true
  tag: "my-element",
  render: function(html) {
    const elementName = "my-element";

    return html`
      <div>Hello ${elementName}!</div>
    `;
  }
});
```

### Styles

To apply styles to your custom element, you can return CSS as a template literal:

```js
new Customel({
  define: true
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
      <button>My button</button>
    `;
  }
});
```

### State

Your state is contained in a state object.
You can modify the state with the `this.setSate` function.
`this.setState` will cause a rerender and you will get a fresh DOM with updated data.

```js
new Customel({
  define: true
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

### Props

Use props to define data that your custom element can recieve from the outside.
Always provide a default value to your props.

#### Simple props

If the default value is a `string`, `number` or a `boolean` then your prop will be available as an attribute on your custom element:

```js
new Customel({
  define: true,
  tag: "my-accordion",
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
<my-accordion title="My special list" open="true"></my-accordion>

<script>

  const accordion = document.querySelector('my-accordion');

  document.querySelector('my-accordion').addEventListener('click' => {
    // "open" is a boolean, and can be changed by changing the attribute
    const isOpen = accordion.getAttribute('open');
    accordion.setAttribute('open', !!);
  })
</script>
```

#### Advanced props

If the default value is a `function`, `object`, `array` or any other type of data, it will be available as a property on the element instead of an attribute.

```js
new Customel({
  define: true,
  tag: "my-list",
  props: {
    todos: ["Buy milk", "Learn stuff"]
  },
  render: function(html) {
    return html`
      <ul>
        ${this.props.todos.map(
          todo => html`
            <li>${todo}</li>
          `
        )}
      </ul>
    `;
  }
});
```

```html
<my-list></my-list>

<script>
  // "todos" is an array and can only be updated to properties on the element
  // setting the property will triggger a rerender of the component, just like setting a new attribute
  document.querySelector("my-list").todos = ["Other things", "More things"];
</script>
```

### Actions

```js
new Customel({
  define: true,
  tag: "my-element",
  actions: {
    showMessage() {
      alert("My message!");
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

## Use in frameworks

### React

### Vue

Custom Elements play nicely with Vue, but for rich data you will need to add a `.prop` on the attribute to bind the value to the property and not the attribute of the custom element.
For now you will also need to replace the whole array every time you update it's value, as Customel does not watch for nested changes. This may come in the future via use of a Proxy.

```html
<div id="vue">
  <my-accordion :title="mainTitle" :items.prop="items"></my-accordion>
</div>
<script>
  new Vue({
    el: "#vue",
    data: {
      mainTitle: "My accordion",
      items: [
        {
          title: "My title",
          content: "Here is some content about this stuff"
        },
        {
          title: "Another title",
          content: "Here is some other content about this stuff"
        }
      ]
    }
  });
</script>
```

### Angular

Customel is [MIT licensed](./LICENSE).
