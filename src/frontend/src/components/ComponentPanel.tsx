import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../store';
import { Component } from '../types';

const ComponentPanel: React.FC = () => {
  const { components, fetchComponents } = useFlowStore();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    llms: true,
    prompts: true,
    chat: true,
  });

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  const filteredComponents = Object.entries(components).reduce<Record<string, Component[]>>(
    (acc, [category, items]) => {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length > 0) {
        acc[category] = filtered;
      }

      return acc;
    },
    {}
  );

  const onDragStart = (event: React.DragEvent, component: Component) => {
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-2">Components</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search components..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.keys(filteredComponents).length === 0 ? (
          <p className="text-gray-500 text-center">No components found</p>
        ) : (
          Object.entries(filteredComponents).map(([category, items]) => (
            <div key={category} className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer bg-gray-200 p-2 rounded"
                onClick={() => toggleCategory(category)}
              >
                <h3 className="font-medium capitalize">{category}</h3>
                <span>{expandedCategories[category] ? '▼' : '►'}</span>
              </div>

              {expandedCategories[category] && (
                <div className="mt-2 space-y-2">
                  {items.map((component) => (
                    <div
                      key={component.id}
                      className="p-2 bg-white border rounded cursor-grab hover:bg-gray-50"
                      draggable
                      onDragStart={(e) => onDragStart(e, component)}
                    >
                      <div className="font-medium">{component.name}</div>
                      <div className="text-xs text-gray-500">{component.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComponentPanel; 