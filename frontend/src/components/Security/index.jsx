// src/components/Security/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Camera
} from 'lucide-react';

export function Security({ userId }) {
  const [securityStatus, setSecurityStatus] = useState({
    twoFactorEnabled: false,
    emailVerified: true,
    phoneVerified: false,
    identityVerified: false,
    lastPasswordChange: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-15'),
    activeDevices: []
  });

  const [verificationDocuments, setVerificationDocuments] = useState({
    idCard: null,
    selfie: null,
    status: 'pending' // pending, verified, rejected
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSecurityData();
  }, [userId]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci datele reale de la server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulare delay
      setIsLoading(false);
    } catch (error) {
      setError('Eroare la încărcarea datelor de securitate');
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    try {
      // Aici ar trebui să procesezi schimbarea parolei
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Eroare la schimbarea parolei');
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      // Aici ar trebui să procesezi activarea/dezactivarea 2FA
      setSecurityStatus(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));
    } catch (error) {
      setError('Eroare la modificarea autentificării în doi pași');
    }
  };

  const handleDocumentUpload = async (type, file) => {
    try {
      // Aici ar trebui să procesezi încărcarea documentului
      setVerificationDocuments(prev => ({
        ...prev,
        [type]: file,
        status: 'pending'
      }));
    } catch (error) {
      setError('Eroare la încărcarea documentului');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Status Securitate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Status Securitate</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Shield className={securityStatus.twoFactorEnabled ? 'text-green-500' : 'text-gray-400'} size={24} />
              <h3 className="font-medium">Autentificare în doi pași</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {securityStatus.twoFactorEnabled ? 'Activat' : 'Dezactivat'}
            </p>
            <button
              onClick={handleTwoFactorToggle}
              className="text-sm text-blue-600 hover:underline"
            >
              {securityStatus.twoFactorEnabled ? 'Dezactivează' : 'Activează'}
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Lock className={securityStatus.identityVerified ? 'text-green-500' : 'text-gray-400'} size={24} />
              <h3 className="font-medium">Verificare Identitate</h3>
            </div>
            <p className="text-sm text-gray-600">
              {securityStatus.identityVerified ? 'Verificat' : 'Neverificat'}
            </p>
          </div>
        </div>
      </div>

      {/* Schimbare Parolă */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Schimbă Parola</h2>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Parola Curentă
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Parolă Nouă
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmă Parola
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schimbă Parola
          </button>
        </form>
      </div>

      {/* Verificare Identitate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Verificare Identitate</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Buletin/CI */}
          <div>
            <h3 className="font-medium mb-2">Buletin/Carte de Identitate</h3>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {verificationDocuments.idCard ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto text-green-500" size={24} />
                  <p className="text-sm text-gray-600">Document încărcat</p>
                  <button
                    onClick={() => handleDocumentUpload('idCard', null)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Șterge
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload('idCard', e.target.files[0])}
                    accept="image/*"
                  />
                  <Upload className="mx-auto text-gray-400" size={24} />
                  <p className="mt-2 text-sm text-gray-600">
                    Click pentru a încărca
                  </p>
                </label>
              )}
            </div>
          </div>

          {/* Upload Selfie */}
          <div>
            <h3 className="font-medium mb-2">Selfie cu Documentul</h3>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {verificationDocuments.selfie ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto text-green-500" size={24} />
                  <p className="text-sm text-gray-600">Selfie încărcat</p>
                  <button
                    onClick={() => handleDocumentUpload('selfie', null)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Șterge
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload('selfie', e.target.files[0])}
                    accept="image/*"
                  />
                  <Camera className="mx-auto text-gray-400" size={24} />
                  <p className="mt-2 text-sm text-gray-600">
                    Click pentru a face o poză
                  </p>
                </label>
              )}
            </div>
          </div>
        </div>

        {verificationDocuments.status === 'pending' && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <p className="text-sm text-yellow-600">
              Documentele tale sunt în curs de verificare
            </p>
          </div>
        )}
      </div>

      {/* Dispozitive Active */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dispozitive Active</h2>
        
        <div className="space-y-4">
          {securityStatus.activeDevices.map(device => (
            <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {device.type === 'mobile' ? (
                  <Smartphone size={20} className="text-gray-400" />
                ) : (
                  <Monitor size={20} className="text-gray-400" />
                )}
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-gray-500">
                    Ultima activitate: {new Date(device.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeviceRevoke(device.id)}
                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default Security;