
import React from 'react';

interface BrowserSimProps {
  activeStep?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
}

/**
 * BrowserSim: Represents the "Website Interactions (Content Script)" part of the architecture.
 * Handles "Visual Effects" (Highlighter) and "Page Scraper" (Conceptual).
 */
export const BrowserSim: React.FC<BrowserSimProps> = ({ activeStep, currentPage, onNavigate }) => {
  // Mock element coordinates for simulation
  const elementCoords: Record<string, { top: string; left: string; width: string; height: string; right?: string }> = {
    'nav-login': { top: '1.5rem', left: 'auto', right: '2rem', width: '100px', height: '40px' },
    'cta-get-started-hero': { top: '18rem', left: '6rem', width: '180px', height: '50px' },
    'cta-get-started-footer': { top: '55rem', left: 'auto', right: '4rem', width: '150px', height: '45px' },
    'cta-search': { top: '18rem', left: '18rem', width: '180px', height: '50px' },
    'input-username': { top: '12rem', left: '2rem', width: '300px', height: '45px' },
    'btn-submit-login': { top: '20rem', left: '2rem', width: '300px', height: '45px' },
    'dash-profile': { top: '1.5rem', left: 'auto', right: '2rem', width: '40px', height: '40px' },
    'dash-settings-btn': { top: '25rem', left: '6rem', width: '140px', height: '40px' },
  };

  const coords = activeStep ? elementCoords[activeStep] : null;

  return (
    <div className="flex-1 h-full bg-white overflow-y-auto relative p-8">
      {/* Dynamic Background Dimming (Visual Effects) */}
      {activeStep && (
        <div className="absolute inset-0 bg-black/60 z-40 transition-opacity duration-500 pointer-events-none" />
      )}

      {/* Pages Section */}
      <div className="relative z-0">
        {currentPage === 'home' && (
          <div className="animate-in fade-in duration-500">
            <nav className="flex items-center justify-between mb-8 border-b pb-4">
              <div className="text-2xl font-bold text-indigo-600">HealthPlus</div>
              <div className="flex gap-4">
                <button className="hover:text-indigo-600 transition">Home</button>
                <button id="nav-doctors" className="hover:text-indigo-600 transition">Doctors</button>
                <button id="nav-login" onClick={() => onNavigate('login')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Login</button>
              </div>
            </nav>
            <main className="max-w-4xl mx-auto pb-20">
              <section className="mb-24 mt-12">
                <h1 className="text-5xl font-extrabold mb-6">Your Health,<br/><span className="text-indigo-600">Reimagined.</span></h1>
                <p className="text-xl text-gray-600 mb-8 max-w-xl">Advanced AI matches you with the best specialists.</p>
                <div className="flex gap-4">
                  <button id="cta-get-started-hero" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl">Get Started</button>
                  <button id="cta-search" className="bg-white border-2 border-indigo-100 px-8 py-3 rounded-xl font-bold text-indigo-600 hover:bg-indigo-50 transition">Search Services</button>
                </div>
              </section>
              <section className="bg-indigo-900 text-white p-12 rounded-[3rem] relative overflow-hidden mt-32">
                <h2 className="text-3xl font-bold mb-4">Ready for a check-up?</h2>
                <button id="cta-get-started-footer" className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold">Get Started</button>
              </section>
            </main>
          </div>
        )}

        {currentPage === 'login' && (
          <div className="max-w-md mx-auto mt-20 animate-in slide-in-from-bottom-10 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Sign In</h1>
            <div className="space-y-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <input id="input-username" type="text" className="w-full p-4 bg-gray-50 border-0 rounded-2xl" placeholder="Username" />
              <button id="btn-submit-login" onClick={() => onNavigate('dashboard')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl">
                Login to Dashboard
              </button>
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <nav className="flex items-center justify-between mb-8 border-b pb-4">
              <div className="text-2xl font-bold text-indigo-600">H+ Portal</div>
              <div id="dash-profile" className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md">JD</div>
            </nav>
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-2xl font-bold mb-4">Welcome John</h3>
              <button id="dash-settings-btn" className="bg-white/20 px-6 py-2 rounded-xl font-bold text-sm">Account Settings</button>
            </div>
          </div>
        )}
      </div>

      {/* Spotlighting Effect (Visual Effects) */}
      {coords && (
        <div 
          className="absolute border-4 border-yellow-400 rounded-2xl animate-pulse z-50 pointer-events-none shadow-[0_0_0_10px_rgba(255,255,255,0.2)] transition-all duration-500"
          style={{
             top: coords.top,
             right: coords.right || 'auto',
             left: coords.left,
             width: coords.width,
             height: coords.height
          }}
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-4 py-2 rounded-full shadow-2xl whitespace-nowrap flex items-center gap-2">
            <span className="w-2 h-2 bg-black rounded-full animate-ping"></span>
            INTERACT HERE
          </div>
        </div>
      )}
    </div>
  );
};
