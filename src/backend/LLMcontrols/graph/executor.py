from typing import Dict, Any, List, Optional
import logging
from .base import Graph, Node, Edge

logger = logging.getLogger(__name__)

class FlowExecutor:
    """Execute a flow graph by building and running LangChain components."""
    
    def __init__(self, graph: Graph):
        self.graph = graph
        self.artifacts = {}  # Store the outputs of each node
    
    def _build_langchain_component(self, node: Node, inputs: Dict[str, Any]) -> Any:
        """
        Build a LangChain component from a node and its inputs.
        This is a placeholder - in a real implementation, this would:
        1. Determine the component type
        2. Import the appropriate LangChain class
        3. Initialize it with the node's data and inputs
        """
        node_type = node.type
        node_data = node.data
        
        # Mock implementation - in a real app, this would use importlib to dynamically import
        # and instantiate LangChain classes based on node type
        logger.info(f"Building component of type {node_type} with data {node_data} and inputs {inputs}")
        
        if node_type == "chat_input":
            # Just pass through the input
            return inputs.get("input_text", "No input provided")
        
        elif node_type == "chat_output":
            # Return the input as output
            return inputs
        
        elif node_type == "llm":
            # Mock LLM that just returns a fixed response
            return {
                "text": f"This is a response from the LLM with model {node_data.get('model_name', 'unknown')}",
                "model": node_data.get("model_name", "unknown"),
                "temperature": node_data.get("temperature", 0.7)
            }
        
        elif node_type == "prompt":
            # Simple template replacement
            template = node_data.get("template", "")
            variables = inputs or {}
            result = template
            for key, value in variables.items():
                result = result.replace(f"{{{{{key}}}}}", str(value))
            return result
        
        else:
            logger.warning(f"Unknown node type: {node_type}")
            return {"error": f"Unknown node type: {node_type}"}
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the flow graph and return the results.
        
        Args:
            input_data: Input data for the flow
            
        Returns:
            Dict containing the results of the flow execution
        """
        try:
            # Get nodes in execution order
            execution_order = self.graph.topological_sort()
            
            # Clear artifacts from previous runs
            self.artifacts = {}
            
            # Add input data to artifacts
            self.artifacts["input"] = input_data
            
            # Execute each node in order
            for node in execution_order:
                logger.info(f"Executing node: {node.id} ({node.type})")
                
                # Get inputs from connected nodes
                node_inputs = {}
                input_edges = self.graph.get_node_inputs(node.id)
                
                for edge in input_edges:
                    source_node_id = edge.source
                    source_handle = edge.sourceHandle
                    target_handle = edge.targetHandle
                    
                    # Get the output from the source node
                    if source_node_id in self.artifacts:
                        source_output = self.artifacts[source_node_id]
                        
                        # If this is a chat input node, use the input data
                        if self.graph.get_node(source_node_id).type == "chat_input":
                            node_inputs["input_text"] = input_data.get("input", "")
                        else:
                            # Otherwise, use the output from the source node
                            node_inputs[target_handle or "input"] = source_output
                
                # Build and execute the LangChain component
                result = self._build_langchain_component(node, node_inputs)
                
                # Store the result in artifacts
                self.artifacts[node.id] = result
            
            # Find output nodes and return their results
            output_nodes = [node for node in self.graph.nodes if node.type == "chat_output"]
            output_results = {}
            
            for node in output_nodes:
                if node.id in self.artifacts:
                    output_results[node.id] = self.artifacts[node.id]
            
            return {
                "results": output_results,
                "artifacts": self.artifacts,
                "execution_order": [node.id for node in execution_order]
            }
        
        except Exception as e:
            logger.exception(f"Error executing flow: {str(e)}")
            return {
                "error": str(e),
                "artifacts": self.artifacts
            } 