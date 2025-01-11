import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, User, Mail, Phone } from 'lucide-react';

const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    phone: '',
    email: '',
    location: '',
    interests: [],
    lookingFor: '',
    photos: []
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Bine ai venit la TerriMatch! 👋</h2>
      <p className="text-center text-gray-600">
        Hai să începem cu informațiile de bază
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nume Complet</Label>
          <Input
            id="name"
            placeholder="Numele tău"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setFormData({...formData, gender: 'male'})}
            className={`p-4 rounded-lg border ${
              formData.gender === 'male' ? 'bg-blue-100 border-blue-500' : 'border-gray-200'
            }`}
          >
            Bărbat
          </button>
          <button
            onClick={() => setFormData({...formData, gender: 'female'})}
            className={`p-4 rounded-lg border ${
              formData.gender === 'female' ? 'bg-pink-100 border-pink-500' : 'border-gray-200'
            }`}
          >
            Femeie
          </button>
        </div>

        <div>
          <Label htmlFor="birthDate">Data Nașterii</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            className="w-full"
          />
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full mt-6"
      >
        Continuă
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Informații de Contact</h2>
      <p className="text-center text-gray-600">
        Ajută-ne să te contactăm mai ușor
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            placeholder="+40 7xx xxx xxx"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="location">Locația</Label>
          <Input
            id="location"
            placeholder="Orașul tău"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="w-full"
        >
          Înapoi
        </Button>
        <Button 
          onClick={handleNext}
          className="w-full"
        >
          Continuă
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Adaugă Poze</h2>
      <p className="text-center text-gray-600">
        Adaugă câteva poze cu tine și cu terenul tău
      </p>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="w-full"
        >
          Înapoi
        </Button>
        <Button 
          onClick={handleNext}
          className="w-full"
        >
          Finalizează
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
