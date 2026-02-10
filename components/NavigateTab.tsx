
import React, { useState, useEffect } from 'react';
import { generateNavGuide } from '../services/geminiService';
import { NavStep } from '../types';

declare const chrome: any;

interface NavigateTabProps {
  currentPage: string;
  onStepActivate: (step: NavStep | null) => void;
  onPageChange: (page: string) => void;
}

export const NavigateTab: React.FC<NavigateTabProps> = ({ currentPage, onStepActivate, onPageChange }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<NavStep[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const handleStartTour = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setCurrentIdx(-1);
    
    try {
      // 1. Get the distilled map directly from the content script
      const tabs = await new Promise<any[]>((resolve) => 
        chrome.tabs.query({ active: true, currentWindow: true }, resolve)
      );
      
      if (!tabs[0]?.id) throw new Error("No active tab");

      const distilledMap = await new Promise<any>((resolve) => 
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SCRAPE_PAGE' }, resolve)
      );

      // 2. Pass the map to the AI
      const tourSteps = await generateNavGuide(goal, distilledMap);
      setSteps(tourSteps);
      if (tourSteps.length > 0) {
        setCurrentIdx(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (steps.length > 0 && currentIdx >= 0) {
      onStepActivate(steps[currentIdx]);
    } else {
      onStepActivate(null);
    }
  }, [currentIdx, steps]);

  const nextStep = () => {
    if (currentIdx < steps.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSteps([]);
      setCurrentIdx(-1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
         <h3 className="font-bold text-gray-800 text-xs uppercase tracking-widest">Precision Navigation</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">What is your goal?</label>
          <div className="relative">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartTour()}
              placeholder="e.g. 'Find the checkout button'"
              className="w-full bg-gray-50 border-0 rounded-2xl text-xs p-4 pr-12 focus:ring-2 focus:ring-indigo-600 transition shadow-inner"
            />
            <button 
              onClick={handleStartTour}
              disabled={loading}
              className="absolute right-2 top-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:scale-105 transition"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'GO'}
            </button>
          </div>
        </div>

        {steps.length > 0 && currentIdx >= 0 ? (
          <div className="bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Step {currentIdx + 1} / {steps.length}</span>
              </div>
              <h4 className="text-lg font-bold leading-tight mb-4">{steps[currentIdx].instruction}</h4>
              <div className="flex gap-2">
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition"
                >
                  {currentIdx === steps.length - 1 ? 'Finish' : 'Next Step'}
                </button>
                <button 
                  onClick={() => { setSteps([]); setCurrentIdx(-1); }}
                  className="bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold text-xs"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-center">
            <div className="text-4xl mb-4">🧭</div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Semantic Map Ready</p>
          </div>
        )}
      </div>
    </div>
  );
};
