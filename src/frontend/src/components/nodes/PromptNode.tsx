import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useFlowStore } from '../../store';

interface PromptNodeData {
  label: string;
  description: string;
  fields: any[];
  template?: string;
}

const PromptNode: React.FC<NodeProps<PromptNodeData>> = ({ data, id, isConnectable }) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [template, setTemplate] = useState<string>(data.template || 'Answer the user as if you were a {role}.');
  
  // Direct handler for template changes
  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    updateNodeData(id, {
      ...data,
      template: newTemplate,
    });
  };
  
  // Initialize data if needed (only once)
  useEffect(() => {
    if (data.template === undefined) {
      updateNodeData(id, {
        ...data,
        template: template,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 shadow-md">
      <div className="font-bold text-gray-800 mb-1">{data.label}</div>
      <div className="text-xs text-gray-600 mb-2">{data.description}</div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Template
        </label>
        <textarea
          value={template}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
          rows={3}
          placeholder="Enter prompt template..."
        />
        <div className="text-xs text-gray-500 mt-1">
          <p>Use {'{'+'input'+'}'} to replace with user input (example: "Explain {'{'+'input'+'}'} simply")</p>
          <p>OR create a system prompt without {'{'+'input'+'}'} (example: "Answer as Donald Trump")</p>
        </div>
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
};

export default PromptNode; 