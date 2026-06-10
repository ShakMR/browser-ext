export const injectStyles = (styles) => {
  const style = document.createElement('style');
  style.textContent = styles?.default || styles?.toString?.() || styles;
  document.head.appendChild(style);
}

export const addToDom = (element) => {
  document.body.appendChild(element);
}
