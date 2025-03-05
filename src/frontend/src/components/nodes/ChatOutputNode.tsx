import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ChatOutputNodeData {
  label: string;
  description: string;
  fields: any[];
  output?: string;
}

const ChatOutputNode: React.FC<NodeProps<ChatOutputNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-md">
      <div className="font-bold text-gray-800 mb-1">{data.label}</div>
      <div className="text-xs text-gray-600 mb-2">{data.description}</div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Output
        </label>
        <div className="w-full p-2 min-h-[60px] max-h-[120px] overflow-y-auto text-sm bg-white border border-gray-300 rounded">
          {data.output || 'No output yet'}
        </div>
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default ChatOutputNode; 