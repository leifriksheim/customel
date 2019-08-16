const emerj = {
  attrs(elem) {
    if (!elem.attributes) return {};
    const attrs = {};
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  },
  nodesByKey(parent, makeKey) {
    const map = {};
    for (let j = 0; j < parent.childNodes.length; j++) {
      const key = makeKey(parent.childNodes[j]);
      if (key) map[key] = parent.childNodes[j];
    }
    return map;
  },
  walkAndAddProps(node, events) {
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
    while (treeWalker.nextNode()) {
      const currentNode = treeWalker.currentNode;
      const currentAttrs = this.attrs(currentNode);
      for (const attr in currentAttrs) {
        if (attr in currentNode) {
          if (attr.startsWith("on")) {
            currentNode.addEventListener(
              attr.slice(2),
              events[currentAttrs[attr]]
            );
            currentNode.removeAttribute(attr);
          } else {
            currentNode[attr] = currentAttrs[attr];
          }
        }
      }
    }
  },
  merge(base, modified, opts, events) {
    opts = opts || {};
    opts.key = opts.key || (node => node.id);

    // If there's no content in the base, it we need to populate the
    // node
    if (!base.childNodes.length) {
      const html = modified;
      base.innerHTML = html;
      this.walkAndAddProps(base, events);
      return;
    }

    if (typeof modified === "string") {
      const html = modified;
      modified = document.createElement("div");
      modified.innerHTML = html;
    }

    // Naively recurse into the children, if any, replacing or updating new
    // elements that are in the same position as old, deleting trailing elements
    // when the new list contains fewer children, or appending new elements if
    // it contains more children.
    //
    // For re-ordered children, the `id` attribute can be used to preserve identity.

    // Loop through .childNodes, not just .children, so we compare text nodes (and
    // comment nodes, fwiw) too.

    const nodesByKey = {
      old: this.nodesByKey(base, opts.key),
      new: this.nodesByKey(modified, opts.key)
    };

    let idx;
    for (idx = 0; modified.firstChild; idx++) {
      const newNode = modified.removeChild(modified.firstChild);

      if (idx >= base.childNodes.length) {
        // It's a new node. Add event listeners if any and, append it.
        this.walkAndAddProps(newNode, events);
        base.appendChild(newNode);
        continue;
      }

      let baseNode = base.childNodes[idx];

      // If the children are indexed, then make sure to retain their identity in
      // the new order.
      const newKey = opts.key(newNode);
      if (opts.key(baseNode) || newKey) {
        // If the new node has a key, then either use its existing match, or insert it.
        // If not, but the old node has a key, then make sure to leave it untouched and insert the new one instead.
        // Else neither node has a key. Just overwrite old with new.
        const match =
          newKey && newKey in nodesByKey.old ? nodesByKey.old[newKey] : newNode;
        if (match !== baseNode) {
          baseNode = base.insertBefore(match, baseNode);
        }
      }

      if (
        baseNode.nodeType !== newNode.nodeType ||
        baseNode.tagName !== newNode.tagName
      ) {
        // Completely different node types. Just update the whole subtree, like React does.
        this.walkAndAddProps(newNode, events);
        base.replaceChild(newNode, baseNode);
      } else if (
        [Node.TEXT_NODE, Node.COMMENT_NODE].indexOf(baseNode.nodeType) >= 0
      ) {
        // This is the terminating case of the merge() recursion.
        if (baseNode.textContent === newNode.textContent) continue; // Don't write if we don't need to.
        baseNode.textContent = newNode.textContent;
      } else if (baseNode !== newNode) {
        // Only need to update if we haven't just inserted the newNode in.
        // It's an existing node with the same tag name. Update only what's necessary.
        // First, make dicts of attributes, for fast lookup:
        const attrs = { base: this.attrs(baseNode), new: this.attrs(newNode) };
        for (const attr in attrs.base) {
          // Remove any missing attributes.
          if (attr in attrs.new) continue;
          baseNode.removeAttribute(attr);
        }
        for (const attr in attrs.new) {
          const hasProperty = attr in baseNode;
          // Add and update any new or modified attributes.
          if (
            attr in attrs.base &&
            attrs.base[attr] === attrs.new[attr] &&
            !hasProperty
          ) {
            continue;
          }

          // check if node has property, set it as property and not attribute
          if (hasProperty) {
            baseNode.removeAttribute(attr);
            baseNode[attr] = attr.startsWith("on")
              ? events[attrs.new[attr]]
              : attrs.new[attr];
          } else {
            baseNode.setAttribute(attr, attrs.new[attr]);
          }
        }
        // Now, recurse into the children. If the only children are text, this will
        // be the final recursion on this node.
        this.merge(baseNode, newNode, {}, events);
      }
    }
    while (base.childNodes.length > idx) {
      // If base has more children than modified, delete the extras.
      base.removeChild(base.lastChild);
    }
  }
};

export default emerj;
