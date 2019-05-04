const EVENTS_LIST = [];
for (const key in document) {
  const isEvent = document[key] === null || typeof document[key] === "function";
  if (key.startsWith("on") && isEvent) EVENTS_LIST.push(key.substring(2));
}

const events = [];

export function bindEvents(selector, context) {
  // Regular event list
  for (const e of EVENTS_LIST) {
    for (const el of selector.querySelectorAll(`[on${e}]`)) {
      const id = el.getAttribute(`on${e}`);
      el.removeAttribute(`on${e}`);

      let cached = events.find(event => event.el === el);
      const newEvent = context[id];

      if (cached) {
        let cachedEvent = cached[e];
        const isEqual = newEvent.toString() === cachedEvent.toString();
        if (!isEqual) {
          // if the cached function is not the same as the new one
          // remove the old event listener and add new one
          el.removeEventListener(e, cachedEvent);
          cachedEvent = newEvent;
          el.addEventListener(e, cachedEvent);
        }
      } else {
        // if no cached event, set the event to event cache
        // and add event listener
        events.push({ el, [e]: newEvent });

        el.addEventListener(e, newEvent);
      }
    }
  }
}
