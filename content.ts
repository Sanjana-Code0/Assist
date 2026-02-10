// Declare chrome for TypeScript in the global scope to fix compilation errors.
declare const chrome: any;

let overlay: HTMLDivElement | null = null;
let spotlight: HTMLDivElement | null = null;

function createOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 999998;
    pointer-events: none;
    transition: opacity 0.5s;
    opacity: 0;
  `;
  document.body.appendChild(overlay);
  
  spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: absolute;
    border: 4px solid #FACC15;
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
    z-index: 999999;
    pointer-events: none;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    display: none;
  `;
  document.body.appendChild(spotlight);
}

chrome.runtime.onMessage.addListener((request: any) => {
  if (request.type === 'HIGHLIGHT_ELEMENT') {
    createOverlay();
    const el = document.querySelector(request.selector);
    if (el && overlay && spotlight) {
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      overlay.style.opacity = '1';
      spotlight.style.display = 'block';
      spotlight.style.top = `${rect.top + scrollY - 4}px`;
      spotlight.style.left = `${rect.left + scrollX - 4}px`;
      spotlight.style.width = `${rect.width + 8}px`;
      spotlight.style.height = `${rect.height + 8}px`;
      
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (request.type === 'CLEAR_HIGHLIGHT') {
    if (overlay) overlay.style.opacity = '0';
    if (spotlight) spotlight.style.display = 'none';
  }
  
  if (request.type === 'APPLY_CONTRAST') {
    document.body.style.filter = request.filter || 'none';
  }
});