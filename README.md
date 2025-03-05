# LLMcontrols

A visual workflow builder for LangChain applications. This project allows you to build complex LLM applications with a drag-and-drop interface.

## Features

- Visual, drag-and-drop interface for LangChain components
- Connect nodes to create custom LLM workflows
- Support for various components:
  - LLMs (OpenAI, etc.)
  - Prompts
  - Chat Input/Output
  - Memory systems (coming soon)
  - Agents (coming soon)
  - Tools (coming soon)
  - Document loaders (coming soon)
  - Vector stores (coming soon)
  - Embeddings (coming soon)

## Project Structure

```
src/
├── backend/
│   └── LLMcontrols/       # Python backend using FastAPI
└── frontend/           # React TypeScript frontend 
```

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm 6+

### Backend Setup

1. Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the backend server:
```bash
python src/backend/run_server.py
```

The backend server will run at http://localhost:8000.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd src/frontend
```

2. Install the required Node.js dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run at http://localhost:3000.

## Run Commands

To run the backend:
```
python src\backend\run_server.py
```

To run the frontend:
```
cd src\frontend && npm start
```

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Create a new flow by clicking "New Flow"
3. Drag components from the left panel to the canvas
4. Connect the components by dragging from one node's output handle to another node's input handle
5. Configure each component by clicking on it
6. Save your flow by clicking "Save"
7. Run your flow by clicking "Run"

## Example Flow

A simple chatbot flow might include:
1. Chat Input node (to get user input)
2. Prompt node (to format the input)
3. OpenAI LLM node (to generate a response)
4. Chat Output node (to display the response)

## Development

This project is under active development. Contributions are welcome!

## License

MIT License 