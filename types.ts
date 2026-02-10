
export enum AccessibilityMode {
  NORMAL = 'NORMAL',
  HIGH_CONTRAST = 'HIGH_CONTRAST',
  DARK_MODE = 'DARK_MODE',
  GRAYSCALE = 'GRAYSCALE',
  PROTANOPIA = 'PROTANOPIA',
  DEUTERANOPIA = 'DEUTERANOPIA',
  TRITANOPIA = 'TRITANOPIA'
}

export interface InteractiveElement {
  tagName: string;
  id?: string;
  className?: string;
  text: string;
  ariaLabel?: string;
  type?: string;
  suggestedSelector: string;
}

export interface DistilledMap {
  url: string;
  title: string;
  interactiveElements: InteractiveElement[];
  mainText: string;
}

export interface NavStep {
  selector: string;
  instruction: string;
  action: 'click' | 'hover' | 'type';
  targetPage: string; 
  contextHint?: string;
  elementDescription?: string;
  expectedOutcome?: string;
  confidenceScore: number;
}

export interface SummaryResult {
  title: string;
  content: string;
  keyTakeaways: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ToolTab {
  CHAT = 'CHAT',
  SUMMARIZE = 'SUMMARIZE',
  ACCESSIBILITY = 'ACCESSIBILITY',
  NAVIGATE = 'NAVIGATE'
}
