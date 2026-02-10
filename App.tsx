
import React, { useState, useEffect } from 'react';
import { SidebarHeader } from './components/SidebarHeader';
import { ChatTab } from './components/ChatTab';
import { SummarizeTab } from './components/SummarizeTab';
import { AccessibilityTab } from './components/AccessibilityTab';
import { NavigateTab } from './components/NavigateTab';
import { AccessibilityMode, ToolTab, NavStep, DistilledMap } from './types';

declare const chrome: any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>(ToolTab.ACCESSIBILITY);
  const [accessMode, setAccessMode] = useState<AccessibilityMode>(AccessibilityMode.NORMAL);
  const [activeStep, setActiveStep] = useState<NavStep | null>(null);
  const [pageInfo, setPageInfo] = useState({ title: 'Ready', url: '' });
  const [contextData, setContextData] = useState<DistilledMap | null>(null);

  const getFilterClass = () => {
    switch (accessMode) {
      case AccessibilityMode.HIGH_CONTRAST: return 'contrast(1.5)';
      case AccessibilityMode.DARK_MODE: return 'invert(1) hue-rotate(180deg)';
      case AccessibilityMode.GRAYSCALE: return 'grayscale(1)';
      case AccessibilityMode.PROTANOPIA: return 'sepia(0.5) saturate(2)';
      default: return 'none';
    }
  };

  const refreshPageData = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs && tabs[0]) {
          setPageInfo({ title: tabs[0].title || 'Unknown Page', url: tabs[0].url || '' });

          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'SCRAPE_PAGE' }, (response: DistilledMap) => {
              if (chrome.runtime.lastError) {
                console.warn("Content script not ready yet or not found on this page.");
                return;
              }
              if (response) {
                setContextData(response);
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'APPLY_CONTRAST',
                  filter: getFilterClass()
                });
              }
            });
          }
        }
      });
    }
  };

  useEffect(() => {
    refreshPageData();

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
      const listener = (tabId: number, changeInfo: any, tab: any) => {
        if (changeInfo.status === 'complete' && tab.active) {
          refreshPageData();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      return () => chrome.tabs.onUpdated.removeListener(listener);
    }
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs && tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'APPLY_CONTRAST',
            filter: getFilterClass()
          }).catch(() => {}); // Ignore errors if content script is gone
        }
      });
    }
  }, [accessMode]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs && tabs[0]?.id) {
          if (activeStep) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'HIGHLIGHT_ELEMENT',
              selector: activeStep.selector
            }).catch(() => {});
          } else {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_HIGHLIGHT' }).catch(() => {});
          }
        }
      });
    }
  }, [activeStep]);

  return (
    <div className="w-[400px] h-[600px] bg-white flex flex-col font-sans border border-gray-200/50 shadow-2xl overflow-hidden">
      <SidebarHeader />

      <div className="flex border-b border-gray-100 bg-white relative z-0">
        {[
          { id: ToolTab.ACCESSIBILITY, label: 'Accessibility', icon: '👁️' },
          { id: ToolTab.NAVIGATE, label: 'Navigation', icon: '🧭' },
          { id: ToolTab.SUMMARIZE, label: 'Intelligence', icon: '✨' },
          { id: ToolTab.CHAT, label: 'Assistant', icon: '💬' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1, 
              padding: '16px 0', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--indigo-600)' : 'var(--gray-400)'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div style={{ position: 'absolute', bottom: 0, height: '2px', width: '100%', backgroundColor: 'var(--indigo-600)' }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(249, 250, 251, 0.3)' }}>
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
          {activeTab === ToolTab.CHAT && <ChatTab distilledMap={contextData} />}
          {activeTab === ToolTab.SUMMARIZE && <SummarizeTab distilledMap={contextData} />}
          {activeTab === ToolTab.ACCESSIBILITY && <AccessibilityTab currentMode={accessMode} onModeChange={setAccessMode} />}
          {activeTab === ToolTab.NAVIGATE && (
            <NavigateTab
              currentPage={pageInfo.url}
              onStepActivate={setActiveStep}
              onPageChange={(url: string) => console.log("Navigation requested to", url)}
            />
          )}
        </div>
      </div>

      <div style={{ padding: '12px 20px', backgroundColor: 'white', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Gemini 3 Pro Active</span>
        </div>
        <button 
          onClick={refreshPageData}
          style={{ 
            backgroundColor: 'var(--indigo-50)', 
            color: 'var(--indigo-600)', 
            border: 'none', 
            padding: '6px 12px', 
            borderRadius: '8px', 
            fontSize: '10px', 
            fontWeight: '900', 
            cursor: 'pointer' 
          }}
        >
          RESCAN
        </button>
      </div>
    </div>
  );
};

export default App;
