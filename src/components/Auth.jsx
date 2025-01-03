// src/components/Auth/Registration.jsx
import React, { useState } from 'react';

function Registration() {
  const [userType, setUserType] = useState('');
  const [age, setAge] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Înregistrare</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Selectează categoria</label>
          <select 
            value={userType} 
            onChange={(e) => setUserType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selectează</option>
            <option value="regular">Utilizator Regular</option>
            <option value="provider">Furnizor de Servicii</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Vârsta</label>
          <input 
            type="number" 
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <label>Accept termenii și condițiile</label>
        </div>
      </div>
    </div>
  );
}