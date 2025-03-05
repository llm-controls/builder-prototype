import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFlowStore } from '../store';
import { Flow } from '../types';

const FlowList: React.FC = () => {
  const { fetchFlows, deleteFlow } = useFlowStore();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFlows = async () => {
      try {
        const fetchedFlows = await fetchFlows();
        setFlows(fetchedFlows);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching flows:', err);
        setError('Failed to load flows. Please try again later.');
        setLoading(false);
      }
    };

    loadFlows();
  }, [fetchFlows]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this flow?')) {
      try {
        await deleteFlow(id);
        setFlows(flows.filter((flow) => flow.id !== id));
      } catch (err) {
        console.error('Error deleting flow:', err);
        alert('Failed to delete flow. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Flows</h1>

      {flows.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">You don't have any flows yet.</p>
          <Link
            to="/flow/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Your First Flow
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <Link
              to={`/flow/${flow.id}`}
              key={flow.id}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{flow.name}</h2>
                  <button
                    onClick={(e) => handleDelete(flow.id, e)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-600 mt-2">{flow.description || 'No description'}</p>
              </div>
              <div className="p-4 bg-gray-50 text-sm text-gray-500">
                {flow.nodes?.length || 0} nodes · {flow.edges?.length || 0} connections
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/flow/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Create New Flow
        </Link>
      </div>
    </div>
  );
};

export default FlowList; 