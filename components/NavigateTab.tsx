
import React, { useState, useEffect } from 'react';
import { generateNavGuide } from '../services/geminiService';
import { NavStep } from '../types';

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
  const [feedbackMode, setFeedbackMode] = useState(false);

  // Auto-track tour progress across simulated "tabs" (pages)
  useEffect(() => {
    if (steps.length > 0 && currentIdx >= 0) {
      const currentStep = steps[currentIdx];
      // Only show overlay if the simulated browser is on the correct page
      if (currentStep.targetPage === currentPage) {
        onStepActivate(currentStep);
      } else {
        onStepActivate(null);
      }
    }
  }, [currentPage, steps, currentIdx]);

  const handleStartTour = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setCurrentIdx(-1);
    onStepActivate(null);

    // Page Scraper: Simulates structured DOM extraction for the AI Controller
    const pageSchema = JSON.stringify({
      pages: {
        home: { elements: ["nav-login", "cta-get-started-hero", "cta-get-started-footer", "cta-search"] },
        login: { elements: ["input-username", "btn-submit-login"] },
        dashboard: { elements: ["dash-profile", "dash-settings-btn"] }
      }
    }, null, 2);
    
    try {
      const tourSteps = await generateNavGuide(goal, currentPage, pageSchema);
      setSteps(tourSteps);
      if (tourSteps.length > 0) {
        setCurrentIdx(0);
        executeStep(tourSteps[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const executeStep = (step: NavStep) => {
    if (step.targetPage && step.targetPage !== currentPage) {
      onPageChange(step.targetPage);
    }
  };

  const nextStep = () => {
    if (currentIdx < steps.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      executeStep(steps[nextIdx]);
    } else {
      setSteps([]);
      setCurrentIdx(-1);
      onStepActivate(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex items-center justify-between">
         <h3 className="font-bold text-gray-800 text-xs uppercase tracking-widest">Natural Navigation</h3>
         <button 
           onClick={() => setFeedbackMode(true)} 
           className="text-[10px] text-gray-400 hover:text-indigo-600 font-bold"
         >
           Report Error
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {feedbackMode && (
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-4">
            <h4 className="text-xs font-bold text-red-700 mb-1">Inaccurate Navigation?</h4>
            <p className="text-[10px] text-red-600 mb-3">Your feedback helps ShadowLight learn the page structure better.</p>
            <div className="flex gap-2">
              <button onClick={() => setFeedbackMode(false)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">Submit Report</button>
              <button onClick={() => setFeedbackMode(false)} className="text-[10px] text-gray-400">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">What is your destination?</label>
          <div className="relative">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartTour()}
              placeholder="e.g. 'Log in and go to settings'"
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
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full">{steps[currentIdx].targetPage}</span>
              </div>
              <h4 className="text-lg font-bold leading-tight mb-2">{steps[currentIdx].instruction}</h4>
              {steps[currentIdx].contextHint && (
                <p className="text-xs text-indigo-100 italic mb-6">💡 Note: {steps[currentIdx].contextHint}</p>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition"
                >
                  {currentIdx === steps.length - 1 ? 'Finish Tour' : 'Next Action'}
                </button>
                <button 
                  onClick={() => { setSteps([]); onStepActivate(null); }}
                  className="bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold text-xs"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        ) : !loading && (
          <div className="space-y-4">
             <div className="p-8 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-center">
               <div className="text-4xl mb-4 grayscale opacity-40">🗺️</div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Smart Assistant Active</p>
               <p className="text-[10px] text-gray-400">Simply describe your goal, and I'll highlight the path for you.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
