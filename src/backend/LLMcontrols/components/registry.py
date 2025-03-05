from typing import Dict, List, Any, Optional, Type
import logging
from .base import Component, Field

logger = logging.getLogger(__name__)

class ComponentRegistry:
    """Registry for available components."""
    
    def __init__(self):
        self.components: Dict[str, Dict[str, Component]] = {
            "llms": {},
            "prompts": {},
            "chat": {},
            "agents": {},
            "chains": {},
            "tools": {},
            "memories": {},
            "embeddings": {},
            "vectorstores": {},
            "documentloaders": {},
            "textsplitters": {},
        }
    
    def register(self, component: Component, category: str) -> None:
        """Register a component in the registry."""
        if category not in self.components:
            logger.warning(f"Category {category} does not exist in the registry. Creating it.")
            self.components[category] = {}
        
        self.components[category][component.name] = component
        logger.info(f"Registered component {component.name} in category {category}")
    
    def get_component(self, category: str, name: str) -> Optional[Component]:
        """Get a component from the registry."""
        if category not in self.components:
            logger.warning(f"Category {category} does not exist in the registry.")
            return None
        
        if name not in self.components[category]:
            logger.warning(f"Component {name} does not exist in category {category}.")
            return None
        
        return self.components[category][name]
    
    def get_all_components(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get all components from the registry."""
        result = {}
        
        for category, components in self.components.items():
            result[category] = [component.to_dict() for component in components.values()]
        
        return result
    
    def load_default_components(self) -> None:
        """Load default components into the registry."""
        # Chat Components
        self.register(
            Component(
                name="ChatInput",
                type="chatInput",
                description="Get chat inputs from users",
                fields=[
                    Field(
                        name="input_text",
                        type="string",
                        description="Input text",
                        required=True
                    ),
                ],
                base_classes=["ChatInput"]
            ),
            category="chat"
        )
        
        self.register(
            Component(
                name="ChatOutput",
                type="chatOutput",
                description="Display chat outputs to users",
                fields=[
                    Field(
                        name="output_text",
                        type="string",
                        description="Output text",
                        required=True
                    ),
                ],
                base_classes=["ChatOutput"]
            ),
            category="chat"
        )
        
        # Prompts
        self.register(
            Component(
                name="Prompt",
                type="prompt",
                description="Template for prompts",
                fields=[
                    Field(
                        name="template",
                        type="string",
                        description="The prompt template",
                        required=True,
                        multiline=True,
                        default="Answer the user as if you were a {role}."
                    ),
                    Field(
                        name="input_variables",
                        type="string",
                        description="Input variables for the template",
                        required=True,
                        is_list=True,
                        default=["input", "role"]
                    ),
                ],
                base_classes=["BasePromptTemplate"]
            ),
            category="prompts"
        )
        
        # LLMs
        self.register(
            Component(
                name="OpenAI",
                type="llm",
                description="OpenAI language model",
                fields=[
                    Field(
                        name="model_name",
                        type="string",
                        description="The model name to use",
                        required=True,
                        default="gpt-4o-mini",
                        options=["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4"]
                    ),
                    Field(
                        name="temperature",
                        type="number",
                        description="Sampling temperature",
                        required=False,
                        default=0.7,
                    ),
                    Field(
                        name="api_key",
                        type="string",
                        description="OpenAI API key",
                        required=True,
                    ),
                ],
                base_classes=["BaseLLM"]
            ),
            category="llms"
        ) 