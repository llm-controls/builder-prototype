import { Node, Edge } from 'reactflow';

// Component types
export type ComponentType = 'chatInput' | 'chatOutput' | 'llm' | 'prompt';

// Field types
export type FieldType = 'string' | 'number' | 'boolean' | 'select' | 'textarea';

export interface Field {
  name: string;
  type: FieldType;
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: string[];
  value?: any;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  fields: Field[];
  category: string;
}

// Flow types
export interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt?: string;
  updatedAt?: string;
}

// API response types
export interface ComponentsResponse {
  [category: string]: Component[];
}

export interface FlowsResponse {
  flows: Flow[];
}

export interface FlowResponse {
  flow: Flow;
}

export interface RunFlowRequest {
  flowId: string;
  inputs: Record<string, any>;
}

export interface RunFlowResponse {
  result: string;
  flowId: string;
  inputs: Record<string, any>;
  timestamp: string;
}

export interface LLMRequest {
  model: string;
  temperature: number;
  prompt: string;
  systemMessage?: string;
  stream?: boolean;
  apiKey?: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  prompt: string;
  metadata?: Record<string, any>;
  error?: string;
} 