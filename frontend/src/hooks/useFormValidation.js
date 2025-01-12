import { useState } from 'react';

const useFormValidation = (initialState) => {
    const [errors, setErrors] = useState({});

    const validateStep1 = (data) => {
        const newErrors = {};

        if (!data.name || data.name.trim().length < 2) {
            newErrors.name = 'Numele este obligatoriu (minim 2 caractere)';
        }

        if (!data.property_type) {
            newErrors.property_type = 'Tipul proprietății este obligatoriu';
        }

        if (!data.location) {
            newErrors.location = 'Locația este obligatorie';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (data) => {
        const newErrors = {};
        
        if (!data.email || !data.email.includes('@')) {
            newErrors.email = 'Email invalid';
        }

        if (!data.property_description || data.property_description.trim().length < 20) {
            newErrors.property_description = 'Descrierea trebuie să aibă minim 20 caractere';
        }

        if (!data.price || isNaN(data.price) || data.price <= 0) {
            newErrors.price = 'Preț invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = (data) => {
        const newErrors = {};

        if (!data.photos || data.photos.length === 0) {
            newErrors.photos = 'Trebuie să adaugi cel puțin o poză';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (data, step) => {
        switch(step) {
            case 1:
                return validateStep1(data);
            case 2:
                return validateStep2(data);
            case 3:
                return validateStep3(data);
            default:
                return true;
        }
    };

    return {
        errors,
        validateForm,
        setErrors
    };
};

export default useFormValidation;
