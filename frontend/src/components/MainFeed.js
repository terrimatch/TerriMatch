import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { supabase } from '../config/supabase';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MainFeed = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        propertyType: '',
        location: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            let query = supabase
                .from('properties')
                .select('*')
                .eq('is_active', true);

            if (searchTerm) {
                query = query.ilike('location', `%${searchTerm}%`);
            }

            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice);
            }

            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }

            if (filters.propertyType) {
                query = query.eq('property_type', filters.propertyType);
            }

            const { data, error } = await query;

            if (error) throw error;

            setProperties(data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (propertyId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase
                .from('likes')
                .insert({
                    user_id: user.id,
                    property_id: propertyId,
                    created_at: new Date()
                });

            if (error) throw error;

            // Poți adăuga aici logica pentru actualizarea UI-ului
        } catch (error) {
            console.error('Error liking property:', error);
        }
    };

    const handleMessage = (propertyId) => {
        // Implementează logica pentru deschiderea chat-ului
        console.log('Open chat for property:', propertyId);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Caută după locație..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex items-center"
                        onClick={() => {/* Implementează logica pentru filtre */}}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtre
                    </Button>
                    
                    <select
                        className="border rounded p-2"
                        value={filters.propertyType}
                        onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                    >
                        <option value="">Toate tipurile</option>
                        <option value="teren_agricol">Teren Agricol</option>
                        <option value="teren_constructii">Teren Construcții</option>
                        <option value="teren_industrial">Teren Industrial</option>
                    </select>
                </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
                <div>Se încarcă...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onLike={handleLike}
                            onMessage={handleMessage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MainFeed;
