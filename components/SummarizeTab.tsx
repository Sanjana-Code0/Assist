
import React, { useState } from 'react';
import { summarizePage, repurposeContent } from '../services/geminiService';
import { SummaryResult } from '../types';

interface SummarizeTabProps {
  pageContent: string;
}

export const SummarizeTab: React.FC<SummarizeTabProps> = ({ pageContent }) => {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [repurposeResult, setRepurposeResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (mode: 'full' | 'short' | 'eli5') => {
    setLoading(true);
    setRepurposeResult(null);
    try {
      const res = await summarizePage(pageContent, mode);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepurpose = async (format: 'tweet' | 'blog' | 'article') => {
    setLoading(true);
    setResult(null);
    try {
      const res = await repurposeContent(pageContent, format);
      setRepurposeResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full bg-white">
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span className="p-1 bg-indigo-100 rounded text-indigo-600">📝</span>
          Summarization
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'full', label: 'Full Summary', icon: '📄' },
            { id: 'short', label: 'Short', icon: '⚡' },
            { id: 'eli5', label: 'Simple', icon: '🧒' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSummarize(mode.id as any)}
              disabled={loading}
              className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-[10px] font-semibold text-gray-700 bg-gray-50"
            >
              <span className="text-xl mb-1">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span className="p-1 bg-purple-100 rounded text-purple-600">✨</span>
          Repurpose Content
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'tweet', label: 'Tweets', icon: '🐦' },
            { id: 'blog', label: 'Blog Post', icon: '✍️' },
            { id: 'article', label: 'Article', icon: '📑' }
          ].map((format) => (
            <button
              key={format.id}
              onClick={() => handleRepurpose(format.id as any)}
              disabled={loading}
              className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition text-[10px] font-semibold text-gray-700 bg-gray-50"
            >
              <span className="text-xl mb-1">{format.icon}</span>
              {format.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs">Analyzing page content...</p>
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h4 className="font-bold text-indigo-900 mb-2">{result.title}</h4>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{result.content}</p>
            {result.keyTakeaways.length > 0 && (
              <ul className="space-y-2">
                {result.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 font-bold">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : repurposeResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-purple-900">Generated Content</h4>
              <button 
                onClick={() => navigator.clipboard.writeText(repurposeResult)}
                className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {repurposeResult}
            </pre>
          </div>
        ) : (
          <div className="text-center py-10 opacity-30 select-none">
            <div className="text-5xl mb-2">📥</div>
            <p className="text-xs">Select an option above to generate insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};
