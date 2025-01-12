import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, User, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useFormValidation from '../hooks/useFormValidation';
import storageService from '../services/storageService';

const RegistrationForm = () => {
    const { user, loading, updateProfile } = useAuth();
    const { errors, validateForm, setErrors } = useFormValidation();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        property_type: '',
        location: '',
        email: '',
        property_description: '',
        price: '',
        photos: [],
        photoUrls: []
    });
    const [uploading, setUploading] = useState(false);

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
        if (validateForm(formData, step)) {
            if (step === 3) {
                try {
                    // Salvează profilul cu URLs poze
                    await updateProfile({
                        ...formData,
                        photos: formData.photoUrls
                    });
                    const tg = window.Telegram.WebApp;
                    if (tg) {
                        tg.close();
                    }
                } catch (error) {
                    console.error('Error saving profile:', error);
                    setErrors({ submit: 'Eroare la salvare. Încearcă din nou.' });
                }
            } else {
                setStep(step + 1);
            }
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const photoUrl = await storageService.uploadImage(file, user.telegram_id);
            
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, file],
                photoUrls: [...prev.photoUrls, photoUrl]
            }));
        } catch (error) {
            console.error('Error uploading photo:', error);
            setErrors({ photo: 'Eroare la încărcarea pozei' });
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = async (index) => {
        try {
            const newPhotos = [...formData.photos];
            const newPhotoUrls = [...formData.photoUrls];
            
            // Șterge poza din storage
            await storageService.deleteImage(newPhotoUrls[index]);
            
            newPhotos.splice(index, 1);
            newPhotoUrls.splice(index, 1);
            
            setFormData(prev => ({
                ...prev,
                photos: newPhotos,
                photoUrls: newPhotoUrls
            }));
        } catch (error) {
            console.error('Error removing photo:', error);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Informații Proprietate</h2>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="property_type">Tip Proprietate</Label>
                    <select
                        id="property_type"
                        value={formData.property_type}
                        onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Selectează tipul</option>
                        <option value="teren_agricol">Teren Agricol</option>
                        <option value="teren_constructii">Teren Construcții</option>
                        <option value="teren_industrial">Teren Industrial</option>
                    </select>
                    {errors.property_type && (
                        <p className="text-red-500 text-sm">{errors.property_type}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="location">Locație</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Orașul/Comuna"
                    />
                    {errors.location && (
                        <p className="text-red-500 text-sm">{errors.location}</p>
                    )}
                </div>
            </div>

            <Button onClick={handleNext} className="w-full">
                Continuă
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Detalii Proprietate</h2>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="property_description">Descriere</Label>
                    <textarea
                        id="property_description"
                        value={formData.property_description}
                        onChange={(e) => setFormData({...formData, property_description: e.target.value})}
                        className="w-full p-2 border rounded"
                        rows={4}
                        placeholder="Descrie proprietatea ta..."
                    />
                    {errors.property_description && (
                        <p className="text-red-500 text-sm">{errors.property_description}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="price">Preț (EUR)</Label>
                    <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="50000"
                    />
                    {errors.price && (
                        <p className="text-red-500 text-sm">{errors.price}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack}>
                    Înapoi
                </Button>
                <Button onClick={handleNext}>
                    Continuă
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Adaugă Poze</h2>
            <p className="text-center text-gray-600">
                Adaugă poze cu proprietatea ta
            </p>

            <div className="grid grid-cols-3 gap-4">
                {formData.photoUrls.map((url, index) => (
                    <div key={index} className="relative">
                        <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                        />
                        <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ))}
                
                {formData.photoUrls.length < 6 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <Camera className="w-8 h-8 text-gray-400" />
                    </label>
                )}
            </div>

            {errors.photos && (
                <p className="text-red-500 text-sm">{errors.photos}</p>
            )}

            <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack}>
                    Înapoi
                </Button>
                <Button onClick={handleNext} disabled={uploading}>
                    {uploading ? 'Se încarcă...' : 'Finalizează'}
                </Button>
            </div>
        </div>
    );

    if (loading) {
        return <div>Se încarcă...</div>;
    }

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
