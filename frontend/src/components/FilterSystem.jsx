import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

export function FilterSystem({ onFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: { min: 18, max: 50 },
    distance: 50,
    interests: [],
    onlineOnly: false
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const locationOptions = [
    'București', 'Cluj', 'Iași', 'Timișoara', 'Brașov',
    'Constanța', 'Craiova', 'Galați', 'Oradea', 'Brăila'
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-white hover:bg-white/20"
      >
        <Filter size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg p-6 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Age Range</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.ageRange.min}
                  onChange={(e) => handleChange('ageRange', { 
                    ...filters.ageRange, 
                    min: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border rounded"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.ageRange.max}
                  onChange={(e) => handleChange('ageRange', {
                    ...filters.ageRange,
                    max: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Distance ({filters.distance} km)
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={filters.distance}
                onChange={(e) => handleChange('distance', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Any Location</option>
                {locationOptions.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Online Only */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="onlineOnly"
                checked={filters.onlineOnly}
                onChange={(e) => handleChange('onlineOnly', e.target.checked)}
                className="rounded text-blue-600"
              />
              <label htmlFor="onlineOnly" className="text-sm">
                Show only online users
              </label>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}