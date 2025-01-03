// src/components/Permissions/index.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Users, Check, X, Search } from 'lucide-react';

export function Permissions({ isAdmin }) {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrator', users: 2 },
    { id: 'moderator', name: 'Moderator', users: 5 },
    { id: 'provider', name: 'Furnizor', users: 50 },
    { id: 'user', name: 'Utilizator', users: 1000 }
  ]);

  const [permissions, setPermissions] = useState({
    dashboard: { view: ['admin', 'moderator'], edit: ['admin'] },
    users: { view: ['admin', 'moderator'], edit: ['admin'] },
    profiles: { view: ['admin', 'moderator', 'provider'], edit: ['admin', 'provider'] },
    chat: { view: ['admin', 'moderator', 'provider', 'user'], edit: ['admin', 'moderator'] },
    bookings: { view: ['admin', 'moderator', 'provider'], edit: ['admin', 'provider'] },
    reports: { view: ['admin'], edit: ['admin'] }
  });

  const togglePermission = (module, action, role) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: prev[module][action].includes(role)
          ? prev[module][action].filter(r => r !== role)
          : [...prev[module][action], role]
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Gestionare Permisiuni</h1>
        
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-4">Modul</th>
              {roles.map(role => (
                <th key={role.id} className="pb-4">
                  <div className="text-center">
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-gray-500">{role.users} utilizatori</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y">
            {Object.entries(permissions).map(([module, actions]) => (
              <tr key={module}>
                <td className="py-4">
                  <div className="font-medium capitalize">{module}</div>
                </td>
                {roles.map(role => (
                  <td key={role.id} className="py-4">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => togglePermission(module, 'view', role.id)}
                        className={`p-1 rounded ${
                          actions.view.includes(role.id)
                            ? 'text-green-600 bg-green-100'
                            : 'text-gray-400 bg-gray-100'
                        }`}
                        title="Vizualizare"
                      >
                        {actions.view.includes(role.id) ? <Check size={16} /> : <X size={16} />}
                      </button>
                      
                      <button
                        onClick={() => togglePermission(module, 'edit', role.id)}
                        className={`p-1 rounded ${
                          actions.edit.includes(role.id)
                            ? 'text-blue-600 bg-blue-100'
                            : 'text-gray-400 bg-gray-100'
                        }`}
                        title="Editare"
                      >
                        {actions.edit.includes(role.id) ? <Check size={16} /> : <X size={16} />}
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Permissions;