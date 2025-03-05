import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
  Connection,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { useFlowStore } from '../store';
import { nodeTypes } from './nodes';
import ComponentPanel from './ComponentPanel';
import { Component } from '../types';

const FlowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    currentFlow,
    fetchFlow,
    saveFlow,
    createNewFlow,
    loadFlow,
    runFlow,
  } = useFlowStore();

  const [flowName, setFlowName] = useState<string>('New Flow');
  const [flowDescription, setFlowDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');

  // Initialize flow
  useEffect(() => {
    const initFlow = async () => {
      if (id === 'new') {
        createNewFlow();
        setFlowName('New Flow');
        setFlowDescription('');
      } else if (id) {
        try {
          const flow = await fetchFlow(id);
          loadFlow(flow);
          setFlowName(flow.name);
          setFlowDescription(flow.description || '');
        } catch (error) {
          console.error('Error loading flow:', error);
          navigate('/');
        }
      }
    };

    initFlow();
  }, [id, createNewFlow, fetchFlow, loadFlow, navigate]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const componentData = JSON.parse(event.dataTransfer.getData('application/json')) as Component;

      // Check if the dropped element is valid
      if (!componentData) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(componentData, position);
    },
    [reactFlowInstance, addNode]
  );

  const handleSaveFlow = async () => {
    if (!currentFlow) return;

    setIsLoading(true);
    try {
      const flowToSave = {
        ...currentFlow,
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
      };

      const savedFlow = await saveFlow(flowToSave);
      if (id === 'new') {
        navigate(`/flow/${savedFlow.id}`);
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Failed to save flow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunFlow = async () => {
    if (!currentFlow) return;

    setIsLoading(true);
    try {
      // Make sure we have a valid flow ID
      if (!currentFlow.id || currentFlow.id === 'new') {
        await handleSaveFlow();
      }
      
      // Find the input node to get the input value
      const inputNode = nodes.find((node) => node.type === 'chatInput');
      const inputValue = inputNode?.data?.inputValue || 'Hello';
      
      // Log nodes for debugging
      console.log('All nodes before running flow:', nodes);
      
      // Explicitly get the API key from the LLM node
      const llmNode = nodes.find((node) => node.type === 'llm');
      console.log('LLM node data:', llmNode?.data);
      
      if (llmNode && llmNode.data.api_key) {
        console.log('Found API key in LLM node:', llmNode.data.api_key.slice(0, 3) + '...');
      } else {
        console.warn('No API key found in LLM node!');
      }

      const result = await runFlow(inputValue);
      setOutput(result);

      // Update the output node with the result
      const outputNode = nodes.find((node) => node.type === 'chatOutput');
      if (outputNode) {
        const updatedNodes = nodes.map((node) => {
          if (node.id === outputNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                output: result,
              },
            };
          }
          return node;
        });
        useFlowStore.setState({ nodes: updatedNodes });
      }
    } catch (error) {
      console.error('Error running flow:', error);
      alert('Failed to run flow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-64 bg-gray-100 overflow-y-auto">
        <ComponentPanel />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b flex justify-between items-center">
          <div>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              placeholder="Flow Name"
            />
            <input
              type="text"
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              className="text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 ml-2"
              placeholder="Description (optional)"
            />
          </div>
          <div className="space-x-2">
            <button
              onClick={handleSaveFlow}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleRunFlow}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default FlowEditor; 