from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional, Union
import uuid
import json
import os
from datetime import datetime

# Use try-except for imports to handle different import paths
try:
    from src.backend.LLMcontrols.components import registry
    from src.backend.LLMcontrols.graph import Graph
    from src.backend.LLMcontrols.llm import OpenAILLM
except ImportError:
    from backend.LLMcontrols.components import registry
    from backend.LLMcontrols.graph import Graph
    from backend.LLMcontrols.llm import OpenAILLM

# Create the router
router = APIRouter()

# Models for API requests and responses
class Component(BaseModel):
    """Component model for the frontend."""
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, int]

class Edge(BaseModel):
    """Edge model for connecting components."""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class Flow(BaseModel):
    """Flow model containing the components and connections."""
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[Component]
    edges: List[Edge]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ChatMessage(BaseModel):
    """Chat message model."""
    role: str = "user"
    content: str
    
class FlowRunRequest(BaseModel):
    """Request model for running a flow."""
    flow_id: str
    inputs: Dict[str, Any] = Field(default_factory=dict)
    
class LLMRequest(BaseModel):
    """Request model for direct LLM calls."""
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    prompt: str
    system_message: Optional[str] = None
    stream: bool = False
    api_key: Optional[str] = None

class LLMResponse(BaseModel):
    """Response model for LLM calls."""
    text: str
    model: str
    prompt: str
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Sample data storage (replace with database in production)
flows = {}

# Load default components
registry.load_default_components()

@router.get("/components")
async def get_components():
    """Get all available component types."""
    return registry.get_all_components()

@router.get("/flows")
async def get_flows():
    """Get all flows."""
    return list(flows.values())

@router.get("/flows/{flow_id}")
async def get_flow(flow_id: str):
    """Get a specific flow by ID."""
    if flow_id not in flows:
        raise HTTPException(status_code=404, detail="Flow not found")
    return flows[flow_id]

@router.post("/flows", response_model=Flow)
async def create_flow(flow: Flow):
    """Create a new flow."""
    flow_dict = flow.dict()
    
    # Add timestamps
    now = datetime.now()
    flow_dict["created_at"] = now
    flow_dict["updated_at"] = now
    
    flows[flow.id] = flow_dict
    return flow_dict

@router.put("/flows/{flow_id}", response_model=Flow)
async def update_flow(flow_id: str, flow: Flow):
    """Update an existing flow."""
    if flow_id != flow.id:
        raise HTTPException(status_code=400, detail="Flow ID in path must match flow ID in body")
    
    # Preserve created_at if flow exists
    flow_dict = flow.dict()
    if flow_id in flows:
        flow_dict["created_at"] = flows[flow_id].get("created_at", datetime.now())
    else:
        flow_dict["created_at"] = datetime.now()
        
    flow_dict["updated_at"] = datetime.now()
    
    flows[flow.id] = flow_dict
    return flow_dict

@router.delete("/flows/{flow_id}")
async def delete_flow(flow_id: str):
    """Delete an existing flow."""
    if flow_id not in flows:
        raise HTTPException(status_code=404, detail="Flow not found")
    del flows[flow_id]
    return {"detail": "Flow deleted"}

@router.post("/run", response_model=Dict[str, Any])
async def run_flow(request: FlowRunRequest):
    """Run a flow with input data."""
    if request.flow_id not in flows:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    flow_data = flows[request.flow_id]
    
    # Parse flow data
    try:
        # Create graph from flow data
        graph = Graph(
            nodes=flow_data["nodes"],
            edges=flow_data["edges"]
        )
        
        # Execute flow (simplified for this example)
        # In a real implementation, we would build and execute a proper LangChain flow
        input_nodes = [node for node in graph.nodes if node.type == "chatInput"]
        prompt_nodes = [node for node in graph.nodes if node.type == "prompt"]
        llm_nodes = [node for node in graph.nodes if node.type == "llm"]
        output_nodes = [node for node in graph.nodes if node.type == "chatOutput"]
        
        # Extract user input
        user_input = request.inputs.get("input", "")
        
        # Process through prompt template if it exists
        prompt = user_input
        if prompt_nodes:
            prompt_node = prompt_nodes[0]
            template = prompt_node.data.get("template", "{input}")
            prompt = template.replace("{input}", user_input)
        
        # Process through LLM if it exists
        response_text = "No LLM node found in flow"
        if llm_nodes:
            llm_node = llm_nodes[0]
            model_name = llm_node.data.get("model_name", "gpt-4o-mini")
            temperature = float(llm_node.data.get("temperature", 0.7))
            api_key = llm_node.data.get("api_key", os.getenv("OPENAI_API_KEY"))
            
            # Validate API key
            if not api_key:
                return {
                    "result": "Error: OpenAI API key is required. Please add your API key to the LLM node.",
                    "flow_id": request.flow_id,
                    "inputs": request.inputs,
                    "error": "Missing API key",
                    "timestamp": datetime.now().isoformat()
                }
            
            try:
                # Create LLM
                llm = OpenAILLM(
                    model_name=model_name,
                    temperature=temperature,
                    api_key=api_key
                )
                
                # Generate response
                response = await llm.generate(prompt)
                
                if "error" in response:
                    return {
                        "result": f"Error: {response['error']}",
                        "flow_id": request.flow_id,
                        "inputs": request.inputs,
                        "error": response["error"],
                        "timestamp": datetime.now().isoformat()
                    }
                
                response_text = response.get("text", "Error generating response")
            except Exception as e:
                error_message = str(e)
                return {
                    "result": f"Error: {error_message}",
                    "flow_id": request.flow_id,
                    "inputs": request.inputs,
                    "error": error_message,
                    "timestamp": datetime.now().isoformat()
                }
        
        return {
            "result": response_text,
            "flow_id": request.flow_id,
            "inputs": request.inputs,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing flow: {str(e)}")

@router.post("/llm/chat", response_model=LLMResponse)
async def chat_with_llm(request: LLMRequest):
    """Send a direct request to the LLM."""
    try:
        llm = OpenAILLM(
            model_name=request.model,
            temperature=request.temperature,
            api_key=request.api_key,
            streaming=request.stream
        )
        
        # Prepare prompt with system message if provided
        prompt = request.prompt
        if request.system_message:
            prompt = f"{request.system_message}\n\n{prompt}"
        
        # Generate response
        response = await llm.generate(prompt)
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}") 