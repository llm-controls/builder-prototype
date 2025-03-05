import ChatInputNode from './ChatInputNode';
import ChatOutputNode from './ChatOutputNode';
import PromptNode from './PromptNode';
import LLMNode from './LLMNode';

export const nodeTypes = {
  chatInput: ChatInputNode,
  chatOutput: ChatOutputNode,
  prompt: PromptNode,
  llm: LLMNode,
};

export {
  ChatInputNode,
  ChatOutputNode,
  PromptNode,
  LLMNode,
}; 