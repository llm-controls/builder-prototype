from typing import Dict, List, Any, Optional, Type
from pydantic import BaseModel, Field as PydanticField

class Field(BaseModel):
    """Field definition for components."""
    name: str
    type: str
    description: Optional[str] = None
    required: bool = False
    default: Optional[Any] = None
    options: Optional[List[Any]] = None
    is_list: bool = False
    show: bool = True
    multiline: bool = False
    value: Optional[Any] = None
    
    class Config:
        extra = "allow"

class Component(BaseModel):
    """Base class for all components."""
    name: str
    type: str
    description: str
    fields: List[Field]
    base_classes: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert component to dictionary."""
        return {
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "fields": [field.dict() for field in self.fields],
            "base_classes": self.base_classes
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Component":
        """Create component from dictionary."""
        fields_data = data.get("fields", [])
        fields = [Field(**field) for field in fields_data]
        
        return cls(
            name=data.get("name", ""),
            type=data.get("type", ""),
            description=data.get("description", ""),
            fields=fields,
            base_classes=data.get("base_classes", [])
        ) 