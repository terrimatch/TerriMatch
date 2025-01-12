import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const RegistrationForm = () => {
    const { user, loading, updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        birthDate: '',
        email: '',
        location: '',
        property_type: '',
        property_description: '',
        photos: []
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.first_name + ' ' + (user.last_name || ''),
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleNext = async () => {
        if (step === 3) {
            try {
                await updateProfile(formData);
                // Succes - închide WebApp-ul sau arată mesaj de succes
                const tg = window.Telegram.WebApp;
                if (tg) {
                    tg.close();
                }
            } catch (error) {
                console.error('Error saving profile:', error);
                // Arată mesaj de eroare
            }
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    if (loading) {
        return <div>Se încarcă...</div>;
    }

    // Restul codului pentru renderStep1, renderStep2, renderStep3 rămâne la fel

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-center">
                        {user?.first_name ? `Bine ai venit, ${user.first_name}!` : 'Completează Profilul'}
                    </h2>
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
