@echo off
echo Starting VisualFlow...

echo Starting backend server...
start cmd /k "pip install -r requirements.txt && python src\backend\run_server.py"

echo Starting frontend...
cd src\frontend
start cmd /k "npm install && npm start"

echo VisualFlow is running!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
cd .. 