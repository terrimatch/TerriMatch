import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

export function TelegramConnect({ isOpen, onClose, onConnect }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!code.trim()) {
      setError('Please enter a connection code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/telegram/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        onConnect(data);
        onClose();
      } else {
        setError('Invalid or expired code');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Connect Telegram</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-4">
              1. Open Telegram and search for <strong>@TerriMatchBot</strong>
              <br />
              2. Send the command 