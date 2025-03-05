"""OpenAI LLM integration."""

import os
from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage

class OpenAILLM:
    """OpenAI LLM integration for LLMcontrols."""
    
    def __init__(
        self,
        model_name: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        api_key: Optional[str] = None,
        streaming: bool = False
    ):
        """Initialize the OpenAI LLM.
        
        Args:
            model_name: The name of the OpenAI model to use.
            temperature: The temperature to use for sampling.
            api_key: The OpenAI API key. If not provided, it will be read from the environment.
            streaming: Whether to stream the response.
        """
        self.model_name = model_name
        self.temperature = temperature
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.streaming = streaming
        
        if not self.api_key:
            raise ValueError(
                "OpenAI API key not provided. Please provide it as an argument or set the OPENAI_API_KEY environment variable."
            )
        
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            openai_api_key=self.api_key,
            streaming=streaming
        )
    
    async def generate(self, prompt: str) -> Dict[str, Any]:
        """Generate a response from the LLM.
        
        Args:
            prompt: The prompt to send to the LLM.
            
        Returns:
            A dictionary containing the generated text and metadata.
        """
        try:
            # Create a human message from the prompt
            message = HumanMessage(content=prompt)
            
            # Generate a response
            response = await self.llm.agenerate([[message]])
            generated_text = response.generations[0][0].text
            
            return {
                "text": generated_text,
                "model": self.model_name,
                "prompt": prompt,
                "metadata": {
                    "temperature": self.temperature,
                    "tokens_used": getattr(response, "llm_output", {}).get("token_usage", {})
                }
            }
        except Exception as e:
            return {
                "error": str(e),
                "model": self.model_name,
                "prompt": prompt
            } 