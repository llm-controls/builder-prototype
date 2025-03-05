import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">LLMcontrols</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Flows</Link>
          <Link to="/flow/new" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">New Flow</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 