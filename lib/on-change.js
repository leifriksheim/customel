export default (objToWatch, onChangeFunction) => {
  if (typeof objToWatch !== "object") {
    return objToWatch;
  }

  const handler = {
    get(target, property, receiver) {
      onChangeFunction();
      const value = Reflect.get(target, property, receiver);
      if (typeof value === "object") {
        return new Proxy(value, handler);
      }
      return value;
    },
    set(target, property, value) {
      onChangeFunction("set");
      return Reflect.set(target, property, value);
    },
    deleteProperty(target, property) {
      onChangeFunction();
      return Reflect.deleteProperty(target, property);
    }
  };
  return new Proxy(objToWatch, handler);
};
