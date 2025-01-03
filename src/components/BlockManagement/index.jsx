// src/components/BlockManagement/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  UserX, 
  Search, 
  AlertTriangle, 
  Clock, 
  Flag,
  MoreVertical,
  Filter,
  X 
} from 'lucide-react';

export function BlockManagement({ userId }) {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, recent, reported
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlock, setNewBlock] = useState({
    userId: '',
    reason: '',
    duration: 'permanent' // temporary, permanent
  });
  const [error, setError] = useState(null);

  const blockReasons = [
    { id: 'harassment', label: 'Hărțuire' },
    { id: 'spam', label: 'Spam' },
    { id: 'inappropriate', label: 'Comportament Nepotrivit' },
    { id: 'fake', label: 'Profil Fals' },
    { id: 'scam', label: 'Înșelăciune' },
    { id: 'other', label: 'Alt Motiv' }
  ];

  useEffect(() => {
    loadBlockedUsers();
  }, [userId, filter]);

  const loadBlockedUsers = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci utilizatorii blocați de la server
      const mockBlockedUsers = [
        {
          id: '1',
          name: 'John Doe',
          avatar: '/profiles/1.jpg',
          blockedAt: new Date(),
          reason: 'harassment',
          duration: 'permanent',
          reports: 3,
          notes: 'Comportament agresiv repetat'
        }
        // ... mai mulți utilizatori blocați
      ];

      setBlockedUsers(mockBlockedUsers);
    } catch (error) {
      setError('Eroare la încărcarea listei de utilizatori blocați');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async (e) => {
    e.preventDefault();
    try {
      // Aici ar trebui să procesezi blocarea utilizatorului pe server
      const blockData = {
        ...newBlock,
        blockedAt: new Date(),
        reports: 0,
        notes: ''
      };

      setBlockedUsers(prev => [blockData, ...prev]);
      setShowBlockModal(false);
      setNewBlock({
        userId: '',
        reason: '',
        duration: 'permanent'
      });
    } catch (error) {
      setError('Eroare la blocarea utilizatorului');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      // Aici ar trebui să deblochezi utilizatorul pe server
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      setError('Eroare la deblocarea utilizatorului');
    }
  };

  const filteredUsers = blockedUsers.filter(user => {
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (filter === 'recent') {
      return Date.now() - new Date(user.blockedAt).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 zile
    }

    if (filter === 'reported') {
      return user.reports > 0;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestionare Blocări</h1>
        <button
          onClick={() => setShowBlockModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserX size={20} />
          Blochează Utilizator
        </button>
      </div>

      {/* Filtre și căutare */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută utilizator blocat..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toate</option>
          <option value="recent">Recente</option>
          <option value="reported">Cu Raportări</option>
        </select>
      </div>

      {/* Lista utilizatorilor blocați */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        Blocat pe {new Date(user.blockedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {user.reports > 0 && (
                      <div className="flex items-center gap-1 text-red-500">
                        <Flag size={14} />
                        <span>{user.reports} raportări</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Deblochează
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {user.reason && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Motiv: </span>
                  {blockReasons.find(r => r.id === user.reason)?.label}
                </p>
                {user.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Note: </span>
                    {user.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nu există utilizatori blocați
          </div>
        )}
      </div>

      {/* Modal Blocare */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Blochează Utilizator</h2>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID sau Username Utilizator
                </label>
                <input
                  type="text"
                  value={newBlock.userId}
                  onChange={e => setNewBlock({...newBlock, userId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Motiv Blocare
                </label>
                <select
                  value={newBlock.reason}
                  onChange={e => setNewBlock({...newBlock, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează motivul</option>
                  {blockReasons.map(reason => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Durată Blocare
                </label>
                <select
                  value={newBlock.duration}
                  onChange={e => setNewBlock({...newBlock, duration: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="permanent">Permanent</option>
                  <option value="temporary">Temporar (30 zile)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Blochează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default BlockManagement;