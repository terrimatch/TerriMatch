import React from 'react';
import { X, CreditCard } from 'lucide-react';

export function WalletModal({ isOpen, onClose, balance, onAddCoins }) {
  if (!isOpen) return null;

  const packages = [
    { amount: 100, price: "10€", bonus: 0 },
    { amount: 500, price: "45€", bonus: 50 },
    { amount: 1000, price: "85€", bonus: 150 },
    { amount: 5000, price: "400€", bonus: 1000 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Portofel TerriCoin</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-600">Sold actual</p>
          <p className="text-3xl font-bold text-blue-600">{balance} TC</p>
        </div>

        <div className="space-y-4">
          {packages.map(pkg => (
            <div
              key={pkg.amount}
              className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => onAddCoins(pkg.amount)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{pkg.amount} TC</h3>
                  {pkg.bonus > 0 && (
                    <p className="text-sm text-green-600">+{pkg.bonus} TC bonus</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{pkg.price}</span>
                  <CreditCard size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}