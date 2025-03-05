import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { Component, ComponentsResponse, Flow } from '../types';
import * as api from '../api';

interface FlowState {
  // Flow data
  nodes: Node[];
  edges: Edge[];
  currentFlow: Flow | null;
  
  // Component data
  components: ComponentsResponse;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Flow operations
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (component: Component, position: { x: number, y: number }) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  
  // API operations
  fetchComponents: () => Promise<void>;
  fetchFlows: () => Promise<Flow[]>;
  fetchFlow: (id: string) => Promise<Flow>;
  saveFlow: (flow: Flow) => Promise<Flow>;
  deleteFlow: (id: string) => Promise<void>;
  runFlow: (input: string) => Promise<string>;
  
  // Flow management
  createNewFlow: () => void;
  loadFlow: (flow: Flow) => void;
  clearCurrentFlow: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  currentFlow: null,
  components: {},
  isLoading: false,
  error: null,
  
  // Flow operations
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, id: uuidv4() }, get().edges),
    });
  },
  
  addNode: (component, position) => {
    const newNode: Node = {
      id: uuidv4(),
      type: component.type,
      position,
      data: {
        ...component,
        label: component.name,
      },
    };
    
    set({
      nodes: [...get().nodes, newNode],
    });
  },
  
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      }),
    });
  },
  
  // API operations
  fetchComponents: async () => {
    set({ isLoading: true, error: null });
    try {
      const components = await api.getComponents();
      set({ components, isLoading: false });
    } catch (error) {
      console.error('Error fetching components:', error);
      set({ error: 'Failed to fetch components', isLoading: false });
    }
  },
  
  fetchFlows: async () => {
    set({ isLoading: true, error: null });
    try {
      const flows = await api.getFlows();
      set({ isLoading: false });
      return flows;
    } catch (error) {
      console.error('Error fetching flows:', error);
      set({ error: 'Failed to fetch flows', isLoading: false });
      return [];
    }
  },
  
  fetchFlow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const flow = await api.getFlow(id);
      set({ isLoading: false });
      return flow;
    } catch (error) {
      console.error(`Error fetching flow ${id}:`, error);
      set({ error: `Failed to fetch flow ${id}`, isLoading: false });
      throw error;
    }
  },
  
  saveFlow: async (flow) => {
    set({ isLoading: true, error: null });
    try {
      let savedFlow;
      if (flow.id) {
        // Update existing flow
        savedFlow = await api.updateFlow(flow.id, flow);
      } else {
        // Create new flow
        const newFlow = {
          ...flow,
          id: uuidv4(),
        };
        savedFlow = await api.createFlow(newFlow);
      }
      set({ currentFlow: savedFlow, isLoading: false });
      return savedFlow;
    } catch (error) {
      console.error('Error saving flow:', error);
      set({ error: 'Failed to save flow', isLoading: false });
      throw error;
    }
  },
  
  deleteFlow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteFlow(id);
      set({ isLoading: false });
      if (get().currentFlow?.id === id) {
        set({ currentFlow: null });
      }
    } catch (error) {
      console.error(`Error deleting flow ${id}:`, error);
      set({ error: `Failed to delete flow ${id}`, isLoading: false });
      throw error;
    }
  },
  
  runFlow: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const currentFlow = get().currentFlow;
      if (!currentFlow) {
        throw new Error('No flow selected');
      }
      
      // Make sure we're using the current nodes from the state
      const currentNodes = get().nodes;
      
      // Create updated flow with current nodes
      const updatedFlow = {
        ...currentFlow,
        nodes: currentNodes
      };
      
      console.log('Running flow with nodes:', currentNodes);
      
      // Save the updated flow with current node data
      const savedFlow = await api.updateFlow(updatedFlow.id, updatedFlow);
      
      const response = await api.runFlow({
        flowId: savedFlow.id,
        inputs: { input },
      });
      
      set({ isLoading: false });
      return response.result;
    } catch (error) {
      console.error('Error running flow:', error);
      set({ error: 'Failed to run flow', isLoading: false });
      throw error;
    }
  },
  
  // Flow management
  createNewFlow: () => {
    const newFlow: Flow = {
      id: '',
      name: 'New Flow',
      description: '',
      nodes: [],
      edges: [],
    };
    
    set({
      currentFlow: newFlow,
      nodes: [],
      edges: [],
    });
  },
  
  loadFlow: (flow) => {
    set({
      currentFlow: flow,
      nodes: flow.nodes,
      edges: flow.edges,
    });
  },
  
  clearCurrentFlow: () => {
    set({
      currentFlow: null,
      nodes: [],
      edges: [],
    });
  },
})); 