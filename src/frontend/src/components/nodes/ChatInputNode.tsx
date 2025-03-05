import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useFlowStore } from '../../store';

interface ChatInputNodeData {
  label: string;
  description: string;
  fields: any[];
  inputValue?: string;
}

const ChatInputNode: React.FC<NodeProps<ChatInputNodeData>> = ({ data, id, isConnectable }) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [inputValue, setInputValue] = useState<string>(data.inputValue || '');
  
  // Direct handler for input value changes
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    updateNodeData(id, {
      ...data,
      inputValue: newValue,
    });
  };
  
  // Initialize data if needed (only once)
  useEffect(() => {
    if (data.inputValue === undefined) {
      updateNodeData(id, {
        ...data,
        inputValue: inputValue,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-md">
      <div className="font-bold text-gray-800 mb-1">{data.label}</div>
      <div className="text-xs text-gray-600 mb-2">{data.description}</div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Input Text
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
          placeholder="Enter text..."
        />
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default ChatInputNode; 