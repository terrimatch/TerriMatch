// src/components/Complaints/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Flag, 
  MessageCircle, 
  User, 
  Clock, 
  FileText,
  Image,
  Send,
  ChevronDown,
  X 
} from 'lucide-react';

export function Complaints({ userId }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComplaint, setNewComplaint] = useState({
    targetUserId: '',
    type: '',
    description: '',
    attachments: []
  });
  const [error, setError] = useState(null);

  const complaintTypes = [
    { id: 'harassment', label: 'Hărțuire' },
    { id: 'fraud', label: 'Fraudă' },
    { id: 'inappropriate', label: 'Conținut Nepotrivit' },
    { id: 'fake', label: 'Profil Fals' },
    { id: 'spam', label: 'Spam' },
    { id: 'other', label: 'Altele' }
  ];

  useEffect(() => {
    loadComplaints();
  }, [userId, filter]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci reclamațiile de la server
      const mockComplaints = [
        {
          id: 1,
          targetUser: {
            id: 'user123',
            name: 'John Doe',
            avatar: '/profiles/1.jpg'
          },
          type: 'inappropriate',
          description: 'Conținut nepotrivit în profil',
          status: 'pending',
          createdAt: new Date(),
          updates: [
            {
              id: 1,
              type: 'status_change',
              message: 'Reclamație primită',
              timestamp: new Date()
            }
          ]
        }
        // ... mai multe reclamații
      ];

      setComplaints(mockComplaints);
    } catch (error) {
      setError('Eroare la încărcarea reclamațiilor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      // Aici ar trebui să trimiți reclamația la server
      const complaint = {
        ...newComplaint,
        id: Date.now(),
        status: 'pending',
        createdAt: new Date(),
        updates: [
          {
            id: 1,
            type: 'status_change',
            message: 'Reclamație primită',
            timestamp: new Date()
          }
        ]
      };

      setComplaints(prev => [complaint, ...prev]);
      setShowNewComplaint(false);
      setNewComplaint({
        targetUserId: '',
        type: '',
        description: '',
        attachments: []
      });
    } catch (error) {
      setError('Eroare la trimiterea reclamației');
    }
  };

  const handleAddAttachment = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setNewComplaint(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles]
    }));
  };

  const handleRemoveAttachment = (attachmentId) => {
    setNewComplaint(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestionare Reclamații</h1>
        <button
          onClick={() => setShowNewComplaint(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reclamație Nouă
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Toate
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          În Așteptare
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Rezolvate
        </button>
      </div>

      {/* Lista de reclamații */}
      <div className="space-y-4">
        {complaints.map(complaint => (
          <div
            key={complaint.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedComplaint(complaint)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                complaint.status === 'pending' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <Flag 
                  className={complaint.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}
                  size={20}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    complaint.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {complaint.status === 'pending' ? 'În așteptare' : 'Rezolvat'}
                  </span>
                  <span className="text-sm text-gray-500">
                    #{complaint.id}
                  </span>
                </div>

                <h3 className="font-medium mt-2">{
                  complaintTypes.find(t => t.id === complaint.type)?.label
                }</h3>
                <p className="text-gray-600 line-clamp-2">{complaint.description}</p>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{complaint.targetUser.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <ChevronDown size={20} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Formular reclamație nouă */}
      {showNewComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reclamație Nouă</h2>
              <button
                onClick={() => setShowNewComplaint(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID Utilizator
                </label>
                <input
                  type="text"
                  value={newComplaint.targetUserId}
                  onChange={e => setNewComplaint({
                    ...newComplaint,
                    targetUserId: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tip Reclamație
                </label>
                <select
                  value={newComplaint.type}
                  onChange={e => setNewComplaint({
                    ...newComplaint,
                    type: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează tipul</option>
                  {complaintTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descriere
                </label>
                <textarea
                  value={newComplaint.description}
                  onChange={e => setNewComplaint({
                    ...newComplaint,
                    description: e.target.value
                  })}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Atașamente
                </label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={e => handleAddAttachment(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Image size={20} className="text-gray-400" />
                    <span className="text-gray-600">
                      Click pentru a adăuga fișiere
                    </span>
                  </label>
                </div>

                {newComplaint.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {newComplaint.attachments.map(att => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm truncate">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewComplaint(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Trimite Reclamația
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalii reclamație */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            {/* ... Detalii reclamație ... */}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default Complaints;