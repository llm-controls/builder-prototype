import axios from 'axios';
import { 
  Component, 
  ComponentsResponse, 
  Flow, 
  LLMRequest, 
  LLMResponse, 
  RunFlowRequest, 
  RunFlowResponse 
} from '../types';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const getComponents = async (): Promise<ComponentsResponse> => {
  const response = await api.get('/components');
  return response.data;
};

export const getFlows = async (): Promise<Flow[]> => {
  const response = await api.get('/flows');
  return response.data;
};

export const getFlow = async (id: string): Promise<Flow> => {
  const response = await api.get(`/flows/${id}`);
  return response.data;
};

export const createFlow = async (flow: Flow): Promise<Flow> => {
  const response = await api.post('/flows', flow);
  return response.data;
};

export const updateFlow = async (id: string, flow: Flow): Promise<Flow> => {
  const response = await api.put(`/flows/${id}`, flow);
  return response.data;
};

export const deleteFlow = async (id: string): Promise<void> => {
  await api.delete(`/flows/${id}`);
};

export const runFlow = async (request: RunFlowRequest): Promise<RunFlowResponse> => {
  const response = await api.post('/run', {
    flow_id: request.flowId,
    inputs: request.inputs,
  });
  return response.data;
};

export const chatWithLLM = async (request: LLMRequest): Promise<LLMResponse> => {
  const response = await api.post('/llm/chat', request);
  return response.data;
}; 