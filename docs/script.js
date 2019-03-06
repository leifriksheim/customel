const isLocal = location.hostname === "localhost";

const markdownURL = isLocal
  ? window.origin + "/README.md"
  : "https://unpkg.com/customel@0.0.3/README.md";

marked.setOptions({
  highlight: function(code, lang) {
    return lang ? hljs.highlight(lang, code).value : code;
  }
});

async function fetchContent(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const content = document.querySelector("#content");
    content.innerHTML = marked(text);
    document.querySelector("customel-toc").node = document.querySelector(
      "#content"
    );
  } catch (e) {
    console.log("error", e);
  }
}

fetchContent(markdownURL);
