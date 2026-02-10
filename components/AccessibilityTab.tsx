
import React from 'react';
import { AccessibilityMode } from '../types';

interface AccessibilityTabProps {
  currentMode: AccessibilityMode;
  onModeChange: (mode: AccessibilityMode) => void;
}

export const AccessibilityTab: React.FC<AccessibilityTabProps> = ({ currentMode, onModeChange }) => {
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

  return (
    <div className="p-4 space-y-8 h-full overflow-y-auto bg-white">
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

      <section className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
        <h4 className="font-bold text-orange-900 text-xs mb-2 flex items-center gap-2">
          <span>⚠️</span> Text Analysis
        </h4>
        <p className="text-[10px] text-orange-800 leading-relaxed mb-3">
          We detected 3 elements with low color contrast that might be difficult to read.
        </p>
        <button className="w-full bg-white text-orange-700 py-2 rounded-lg font-bold text-[10px] shadow-sm hover:bg-orange-100 transition">
          Auto-Fix Contrast Issues
        </button>
      </section>
    </div>
  );
};
