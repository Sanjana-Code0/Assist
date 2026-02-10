
import { summarizePage, generateNavGuide, chatWithContext } from './services/geminiService';

declare const chrome: any;

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  const handleError = (err: any) => {
    console.error('AI Controller Error:', err);
    sendResponse({ error: err.message || 'Unknown AI error' });
  };

  if (request.type === 'SUMMARIZE') {
    summarizePage(request.content, request.mode)
      .then(sendResponse)
      .catch(handleError);
    return true;
  }
  
  // Fixed: Passed 2 arguments (goal, distilledMap) to match the service definition.
  if (request.type === 'GENERATE_NAV') {
    generateNavGuide(request.goal, request.distilledMap)
      .then(sendResponse)
      .catch(handleError);
    return true;
  }

  if (request.type === 'CHAT') {
    chatWithContext(request.query, request.context)
      .then(res => sendResponse({ text: res }))
      .catch(handleError);
    return true;
  }
});
