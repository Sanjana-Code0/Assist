
// Declare chrome for TypeScript in the global scope to fix compilation errors.
declare const chrome: any;

let overlay: HTMLDivElement | null = null;
let spotlight: HTMLDivElement | null = null;
let themeStyleTag: HTMLStyleElement | null = null;

function createOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.4);
    z-index: 999998;
    pointer-events: none;
    transition: opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(overlay);
  
  spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: absolute;
    border: 3px solid #6366f1;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5), 0 0 0 4000px rgba(0,0,0,0.3);
    z-index: 999999;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: none;
  `;
  document.body.appendChild(spotlight);
}

/**
 * Semantic Distiller: Prunes the DOM to only essential interactive elements.
 * This saves massive amounts of tokens while keeping navigation accurate.
 */
function getDistilledMap() {
  const interactiveSelectors = 'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  const elements = document.querySelectorAll(interactiveSelectors);
  
  const map = Array.from(elements).map((el: any) => {
    const rect = el.getBoundingClientRect();
    // Filter out invisible elements
    if (rect.width === 0 || rect.height === 0 || getComputedStyle(el).display === 'none') return null;

    return {
      tagName: el.tagName.toLowerCase(),
      id: el.id || undefined,
      className: el.className.toString().split(' ').slice(0, 3).join(' ') || undefined,
      text: (el.innerText || el.value || el.placeholder || '').substring(0, 50).trim(),
      ariaLabel: el.getAttribute('aria-label') || undefined,
      type: el.type || undefined,
      // Best selector guess for the model
      suggestedSelector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.toString().split(' ')[0] : ''}`
    };
  }).filter(Boolean);

  return {
    url: window.location.href,
    title: document.title,
    interactiveElements: map,
    mainText: document.body.innerText.substring(0, 2000) // Small text sample for context
  };
}

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.type === 'HIGHLIGHT_ELEMENT') {
    createOverlay();
    const el = document.querySelector(request.selector);
    if (el && overlay && spotlight) {
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      overlay.style.opacity = '1';
      spotlight.style.display = 'block';
      spotlight.style.top = `${rect.top + scrollY - 2}px`;
      spotlight.style.left = `${rect.left + scrollX - 2}px`;
      spotlight.style.width = `${rect.width + 4}px`;
      spotlight.style.height = `${rect.height + 4}px`;
      
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (request.type === 'CLEAR_HIGHLIGHT') {
    if (overlay) overlay.style.opacity = '0';
    if (spotlight) spotlight.style.display = 'none';
  }
  
  if (request.type === 'SCRAPE_PAGE') {
    sendResponse(getDistilledMap());
    return true;
  }

  if (request.type === 'APPLY_THEME') {
    if (!themeStyleTag) {
      themeStyleTag = document.createElement('style');
      document.head.appendChild(themeStyleTag);
    }
    themeStyleTag.innerHTML = `
      * { background-color: ${request.bgColor} !important; color: ${request.textColor} !important; border-color: ${request.textColor} !important; }
      img, video { filter: contrast(1.2) grayscale(0.5) !important; }
    `;
  }

  if (request.type === 'RESET_THEME') {
    if (themeStyleTag) themeStyleTag.innerHTML = '';
  }
});
