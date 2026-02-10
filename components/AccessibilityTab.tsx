
import React, { useState, useEffect } from 'react';
import { AccessibilityMode } from '../types';

declare const chrome: any;

interface AccessibilityTabProps {
  currentMode: AccessibilityMode;
  onModeChange: (mode: AccessibilityMode) => void;
}

export const AccessibilityTab: React.FC<AccessibilityTabProps> = ({ currentMode, onModeChange }) => {
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [contrastRatio, setContrastRatio] = useState(21);

  const presets = [
    { id: AccessibilityMode.NORMAL, label: 'Standard View', icon: '🌐', desc: 'No modifications' },
    { id: AccessibilityMode.HIGH_CONTRAST, label: 'High Contrast', icon: '👁️', desc: 'Sharper visibility' },
    { id: AccessibilityMode.DARK_MODE, label: 'Dark Mode', icon: '🌙', desc: 'Easier on the eyes' },
    { id: AccessibilityMode.GRAYSCALE, label: 'Grayscale', icon: '🔳', desc: 'Remove distractions' }
  ];

  const colorBlindness = [
    { id: AccessibilityMode.PROTANOPIA, label: 'Protanopia', desc: 'Red-blind' },
    { id: AccessibilityMode.DEUTERANOPIA, label: 'Deuteranopia', desc: 'Green-blind' },
    { id: AccessibilityMode.TRITANOPIA, label: 'Tritanopia', desc: 'Blue-blind' }
  ];

  // WCAG Contrast Calculation
  const getLuminance = (hex: string) => {
    const rgb = hex.replace(/^#/, '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
    const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  useEffect(() => {
    const l1 = getLuminance(textColor);
    const l2 = getLuminance(bgColor);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    setContrastRatio(parseFloat(ratio.toFixed(2)));
  }, [textColor, bgColor]);

  const handleApplyTheme = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'APPLY_THEME',
            textColor,
            bgColor
          });
        }
      });
    }
  };

  const handleReset = () => {
    setTextColor('#000000');
    setBgColor('#ffffff');
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'RESET_THEME' });
        }
      });
    }
  };

  const getCompliance = () => {
    if (contrastRatio >= 7) return { label: 'AAA', color: 'text-green-600 bg-green-50' };
    if (contrastRatio >= 4.5) return { label: 'AA', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Fail', color: 'text-red-600 bg-red-50' };
  };

  const compliance = getCompliance();

  return (
    <div className="p-4 space-y-8 h-full overflow-y-auto bg-white">
      {/* Visual Presets */}
      <section>
        <h3 className="font-bold text-gray-800 text-sm mb-4">Visual Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-2xl border-2 text-left transition ${
                currentMode === mode.id 
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                  : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-bold text-xs text-gray-900">{mode.label}</div>
              <div className="text-[10px] text-gray-500 leading-tight">{mode.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Adjust Text Color Section */}
      <section className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="bg-indigo-50/50 p-3 px-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
             <span className="text-gray-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
             </span>
             <h3 className="font-bold text-gray-800 text-sm">Adjust Text Color</h3>
          </div>
          <button className="text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Text Color Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Text Color</label>
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-indigo-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
              <div className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: textColor }} />
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={textColor} 
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="w-16 h-2 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80" />
            </div>
          </div>

          {/* Background Color Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Background Color</label>
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-indigo-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
              <div className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: bgColor }} />
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="w-16 h-2 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80" />
            </div>
          </div>

          {/* Preview Box */}
          <div 
            className="h-20 rounded-xl border border-gray-100 flex items-center justify-center transition-colors duration-300 shadow-inner"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            <p className="font-bold text-sm">Sample text with your colors</p>
          </div>

          {/* Result / Badge */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
             <span className="text-xs font-semibold text-gray-600">Contrast Ratio: <span className="text-gray-900">{contrastRatio.toFixed(2)}:1</span></span>
             <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[10px] ${compliance.color}`}>
                {compliance.label !== 'Fail' && (
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                )}
                {compliance.label}
             </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleApplyTheme}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md active:scale-95"
            >
              Apply
            </button>
            <button 
              onClick={handleReset}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl text-xs transition active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Color Blindness Filters */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-sm">Color Blindness Filters</h3>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Simulation</span>
        </div>
        <div className="space-y-2">
          {colorBlindness.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition ${
                currentMode === mode.id 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="text-left">
                <div className="font-bold text-sm">{mode.label}</div>
                <div className={`text-xs ${currentMode === mode.id ? 'text-indigo-200' : 'text-gray-400'}`}>{mode.desc}</div>
              </div>
              {currentMode === mode.id && <span className="text-xl">✓</span>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
