const events = [];

export function bindEvents(selector, context) {
  // Regular event list

  let eventNames = [...selector.querySelectorAll("*")].reduce(
    (acc, element) => {
      const attributes = element
        .getAttributeNames()
        .filter(attr => attr.startsWith("on"));
      return [...acc, ...attributes];
    },
    []
  );

  eventNames.forEach(e => {
    // e is for example 'onclick'
    for (const el of selector.querySelectorAll(`[${e}]`)) {
      const id = el.getAttribute(e);
      el.removeAttribute(e);

      // get just 'click' for instance
      const eventName = e.replace("on", "");

      let cached = events.find(event => event.el === el);
      const newEvent = context[id];

      if (cached) {
        let cachedEvent = cached[eventName];
        const isEqual = newEvent.toString() === cachedEvent.toString();
        if (!isEqual) {
          // if the cached function is not the same as the new one
          // remove the old event listener and add new one
          el.removeEventListener(eventName, cachedEvent);
          cachedEvent = newEvent;
          el.addEventListener(eventName, cachedEvent);
        }
      } else {
        // if no cached event, set the event to event cache
        // and add event listener
        events.push({ el, [eventName]: newEvent });

        el.addEventListener(eventName, newEvent);
      }
    }
  });
}
