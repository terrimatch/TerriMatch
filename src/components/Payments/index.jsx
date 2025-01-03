// src/components/Payments/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Plus, 
  Trash, 
  History,
  Receipt,
  ChevronDown,
  Shield 
} from 'lucide-react';

export function Payments({ userId }) {
  const [activeTab, setActiveTab] = useState('payment-methods');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentData();
  }, [userId]);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci datele reale de la server
      // Pentru exemplu folosim date statice
      setPaymentMethods([
        {
          id: '1',
          type: 'visa',
          last4: '4242',
          expiry: '12/24',
          isDefault: true
        },
        {
          id: '2',
          type: 'mastercard',
          last4: '8888',
          expiry: '10/25',
          isDefault: false
        }
      ]);

      setTransactions([
        {
          id: '1',
          amount: 500,
          type: 'credit',
          description: 'Achiziție TerriCoins',
          status: 'completed',
          date: new Date('2024-01-15'),
          paymentMethod: '**** 4242'
        },
        {
          id: '2',
          amount: 100,
          type: 'debit',
          description: 'Video Call cu Ana M.',
          status: 'completed',
          date: new Date('2024-01-14'),
          paymentMethod: '**** 4242'
        }
      ]);
    } catch (error) {
      setError('Eroare la încărcarea datelor de plată');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      // Aici ar trebui să procesezi adăugarea cardului
      setIsAddingCard(false);
      setNewCard({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
      });
      await loadPaymentData();
    } catch (error) {
      setError('Eroare la adăugarea cardului');
    }
  };

  const handleRemoveCard = async (cardId) => {
    try {
      // Aici ar trebui să procesezi ștergerea cardului
      setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      setError('Eroare la ștergerea cardului');
    }
  };

  const handleSetDefaultCard = async (cardId) => {
    try {
      // Aici ar trebui să procesezi setarea cardului implicit
      setPaymentMethods(prev => prev.map(card => ({
        ...card,
        isDefault: card.id === cardId
      })));
    } catch (error) {
      setError('Eroare la setarea cardului implicit');
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'payment-methods'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Metode de Plată
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'transactions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Tranzacții
        </button>
      </div>

      {/* Payment Methods */}
      {activeTab === 'payment-methods' && (
        <div className="space-y-6">
          {/* Carduri existente */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Carduri Salvate</h2>
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                  <span>Adaugă Card</span>
                </button>
              </div>

              <div className="space-y-4">
                {paymentMethods.map(card => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        {card.type === 'visa' ? 'VISA' : 'MC'}
                      </div>
                      <div>
                        <p className="font-medium">**** {card.last4}</p>
                        <p className="text-sm text-gray-500">Expiră: {card.expiry}</p>
                      </div>
                      {card.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-sm rounded">
                          Implicit
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <button
                          onClick={() => handleSetDefaultCard(card.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Setează Implicit
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveCard(card.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formular adăugare card */}
          {isAddingCard && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Adaugă Card Nou</h3>
                <button
                  onClick={() => setIsAddingCard(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Număr Card
                  </label>
                  <input
                    type="text"
                    value={newCard.number}
                    onChange={e => setNewCard({...newCard, number: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Data Expirării
                    </label>
                    <input
                      type="text"
                      value={newCard.expiry}
                      onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={newCard.cvc}
                      onChange={e => setNewCard({...newCard, cvc: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nume pe Card
                  </label>
                  <input
                    type="text"
                    value={newCard.name}
                    onChange={e => setNewCard({...newCard, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="JOHN DOE"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Adaugă Card
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Istoric Tranzacții</h2>

            <div className="space-y-4">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'credit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? <DollarSign size={20} /> : <History size={20} />}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date.toLocaleDateString()} • {transaction.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} TC
                    </p>
                    <p className="text-sm text-gray-500">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                Încarcă mai multe
              </button>
            </div>
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

export default Payments;