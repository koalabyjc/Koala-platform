/* ============================================
   KOALA — DOM Utilities
   Helper functions for DOM manipulation
   ============================================ */

/**
 * Create an element with optional class, attributes, and children
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  if (options.className) element.className = options.className;
  if (options.id) element.id = options.id;
  if (options.innerHTML) element.innerHTML = options.innerHTML;
  if (options.textContent) element.textContent = options.textContent;
  
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  if (options.styles) {
    Object.entries(options.styles).forEach(([key, value]) => {
      element.style[key] = value;
    });
  }
  
  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    });
  }
  
  if (options.events) {
    Object.entries(options.events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }
  
  return element;
}

/**
 * Query selector shorthand
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query selector all shorthand
 */
export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/**
 * Set inner HTML safely
 */
export function render(container, html) {
  if (typeof container === 'string') {
    container = qs(container);
  }
  if (container) {
    container.innerHTML = html;
  }
}
