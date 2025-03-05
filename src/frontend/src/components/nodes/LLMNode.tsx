import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useFlowStore } from '../../store';

interface LLMNodeData {
  label: string;
  description: string;
  fields: any[];
  model_name?: string;
  temperature?: number;
  api_key?: string;
}

const LLMNode: React.FC<NodeProps<LLMNodeData>> = ({ data, id, isConnectable }) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [model, setModel] = useState<string>(data.model_name || 'gpt-4o-mini');
  const [temperature, setTemperature] = useState<number>(data.temperature || 0.7);
  const [apiKey, setApiKey] = useState<string>(data.api_key || '');
  
  // Only update node data when a value actually changes
  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    updateNodeData(id, {
      ...data,
      model_name: newModel,
    });
  };
  
  const handleTemperatureChange = (newTemp: number) => {
    setTemperature(newTemp);
    updateNodeData(id, {
      ...data,
      temperature: newTemp,
    });
  };
  
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    updateNodeData(id, {
      ...data,
      api_key: newKey,
    });
  };
  
  // Initialize data if needed (only once)
  useEffect(() => {
    if (data.model_name === undefined || data.temperature === undefined) {
      updateNodeData(id, {
        ...data,
        model_name: model,
        temperature: temperature,
        api_key: apiKey,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-md">
      <div className="font-bold text-gray-800 mb-1">{data.label}</div>
      <div className="text-xs text-gray-600 mb-2">{data.description}</div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4">gpt-4</option>
        </select>
      </div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Temperature: {temperature}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
          placeholder="Enter OpenAI API key..."
        />
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
      />
    </div>
  );
};

export default LLMNode; 