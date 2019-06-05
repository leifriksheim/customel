<div align="center">
  <img style="margin: 0 auto;" width="300px" align="center" src="/media/logo.png" />
</div>

<hr />

<p align="center">
<a href="https://www.npmjs.com/package/customel"><img src="https://img.shields.io/npm/v/customel.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/customel"><img src="https://img.shields.io/npm/l/customel.svg" alt="License"></a>
</p>

```
Customel is just an experiment at the moment. Don't use in production.
```

> A tiny wrapper function to simplify the creation of Custom Elements/Web Components.

- **Lightweight 🕊️** Customel is a small wrapper around the HTMLElement Class and weight about **2kb**.
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
  import customel from "//unpkg.com/customel?module";
</script>
```

### NPM

```
npm install customel
```

```js
import customel from "customel";
```

## Getting started

The easiest way to try out Customel is using the [JSFiddle Hello World example](https://jsfiddle.net/waysofperception/zp2rd7s5/10/). You can follow the Quick Start from here.

First create a file called `my-element.js`. Import Customel, create your component, and define it.

```js
// my-element.js
import customel from "//unpkg.com/customel?module";

const Element = {
  template() {
    return "<div>Hello my new element!</div>";
  }
};

customElements.define("my-element", customel(Element));
```

Create a `index.html` file, and import `my-element.js`.
Your custom element is now ready to be used!

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

### Template

You probably want to render some html inside your custom element.
The easiest way is to just return a string with some HTML like this:

```js
const Element = {
  template() {
    return "<div>HTML as a string</div>";
  }
};
```

This is not recommended if you wan't to add events to your component, or loop through a list.

The template function also provides a `html` function that we can use.
The `html` function is a tagged template that allows you to write regular HTML with template literals for fast DOM-updates without a Virtual DOM.

```js
const items = ["Item 1", "Item 2"];

const Element = {
  template: function(html) {
    return html`
      <button onclick=${() => alert("Clicked")}>Button</button>
      <ul>
        ${items.map(
          item =>
            html`
              <li>${item}</li>
            `
        )}
      </ul>
    `;
  }
};
```

### Styles

To apply styles to your custom element, you can return CSS as a string:

```js
const Element = {
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
  template: function(html) {
    return html`
      <button>My button</button>
    `;
  }
};
```

### State

Your state is contained in a state object.
You can modify the state with the `this.setSate` function.
`this.setState` will cause a rerender and you will get a fresh DOM with updated data.

```js
const Element = {
  define: true
  tag: "my-element",
  state: {
    active: false
  },
  template: function(html) {
    return html`
      <button onclick=${() => this.setState({ active: true })}>
        Active state is ${this.state.active}
      </button>
    `;
  }
};
```

### Props

Use props to define data that your custom element can recieve from the outside.
Always provide a default value to your props.

#### Simple props

If the default value is a `string`, `number` or a `boolean` then your prop will be available as an attribute on your custom element:

```js
const Accordion = {
  props: {
    open: false
  },
  template: function(html) {
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
};

customElement.define("my-accordion", customel(Accordion));
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
const List = {
  props: {
    todos: ["Buy milk", "Learn stuff"]
  },
  template: function(html) {
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
};

customElement.define("my-list", customel(List));
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
const Element = {
  props: {
    title: "Title"
  },
  actions: {
    showMessage() {
      alert("Title: is" + this.title);
    }
  },
  template: function(html) {
    return html`
      <button onclick=${() => this.actions.showMessage()}>
        My button
      </button>
    `;
  }
};
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

Coming...

### React

Coming...

Customel is [MIT licensed](./LICENSE).
