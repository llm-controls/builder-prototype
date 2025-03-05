import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import FlowList from './components/FlowList';
import FlowEditor from './components/FlowEditor';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<FlowList />} />
            <Route path="/flow/:id" element={<FlowEditor />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
