const events = [];

export function bindEvents(selector, context) {
  // Regular event list

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
