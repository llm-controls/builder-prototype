from typing import Dict, List, Any, Optional
import uuid

class Node:
    """A node in the flow graph, representing a LangChain component."""
    
    def __init__(
        self,
        id: str,
        type: str,
        data: Dict[str, Any],
        position: Dict[str, int]
    ):
        """Initialize a node.
        
        Args:
            id: The unique identifier of the node.
            type: The type of the node (chatInput, chatOutput, llm, prompt).
            data: The data associated with the node.
            position: The position of the node in the flow editor.
        """
        self.id = id
        self.type = type
        self.data = data
        self.position = position
        self.inputs = {}
        self.outputs = {}
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Node":
        """Create a node from a dictionary."""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            type=data.get("type", ""),
            data=data.get("data", {}),
            position=data.get("position", {"x": 0, "y": 0})
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to a dictionary."""
        return {
            "id": self.id,
            "type": self.type,
            "data": self.data,
            "position": self.position
        }


class Edge:
    """An edge connecting two nodes in the flow graph."""
    
    def __init__(
        self,
        id: str,
        source: str,
        target: str,
        sourceHandle: Optional[str] = None,
        targetHandle: Optional[str] = None
    ):
        """Initialize an edge.
        
        Args:
            id: The unique identifier of the edge.
            source: The ID of the source node.
            target: The ID of the target node.
            sourceHandle: The handle of the source node.
            targetHandle: The handle of the target node.
        """
        self.id = id
        self.source = source
        self.target = target
        self.sourceHandle = sourceHandle
        self.targetHandle = targetHandle
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Edge":
        """Create an edge from a dictionary."""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            source=data.get("source", ""),
            target=data.get("target", ""),
            sourceHandle=data.get("sourceHandle"),
            targetHandle=data.get("targetHandle")
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert edge to a dictionary."""
        return {
            "id": self.id,
            "source": self.source,
            "target": self.target,
            "sourceHandle": self.sourceHandle,
            "targetHandle": self.targetHandle
        }


class Graph:
    """A graph representing a flow of LangChain components."""
    
    def __init__(self, nodes: List[Dict[str, Any]] = None, edges: List[Dict[str, Any]] = None):
        """Initialize a graph.
        
        Args:
            nodes: The nodes in the graph.
            edges: The edges in the graph.
        """
        self.nodes = [Node.from_dict(node) for node in (nodes or [])]
        self.edges = [Edge.from_dict(edge) for edge in (edges or [])]
        self.node_map = {node.id: node for node in self.nodes}
    
    def add_node(self, node: Dict[str, Any]) -> Node:
        """Add a node to the graph."""
        node_obj = Node.from_dict(node)
        self.nodes.append(node_obj)
        self.node_map[node_obj.id] = node_obj
        return node_obj
    
    def add_edge(self, edge: Dict[str, Any]) -> Edge:
        """Add an edge to the graph."""
        edge_obj = Edge.from_dict(edge)
        self.edges.append(edge_obj)
        return edge_obj
    
    def get_node(self, node_id: str) -> Optional[Node]:
        """Get a node by ID."""
        return self.node_map.get(node_id)
    
    def get_node_inputs(self, node_id: str) -> List[Edge]:
        """Get all edges that target the specified node."""
        return [edge for edge in self.edges if edge.target == node_id]
    
    def get_node_outputs(self, node_id: str) -> List[Edge]:
        """Get all edges that originate from the specified node."""
        return [edge for edge in self.edges if edge.source == node_id]
    
    def topological_sort(self) -> List[Node]:
        """
        Sort nodes in topological order (nodes with no inputs first).
        This is useful for determining the execution order.
        """
        # Create a dictionary to track visited nodes
        visited = {node.id: False for node in self.nodes}
        temp_mark = {node.id: False for node in self.nodes}
        order = []
        
        def visit(node_id):
            if temp_mark[node_id]:
                raise ValueError("Graph has a cycle, cannot determine execution order")
            if not visited[node_id]:
                temp_mark[node_id] = True
                for edge in self.get_node_outputs(node_id):
                    visit(edge.target)
                temp_mark[node_id] = False
                visited[node_id] = True
                order.insert(0, self.get_node(node_id))
        
        # Visit all nodes
        for node in self.nodes:
            if not visited[node.id]:
                visit(node.id)
        
        return order
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert graph to a dictionary."""
        return {
            "nodes": [node.to_dict() for node in self.nodes],
            "edges": [edge.to_dict() for edge in self.edges]
        } 