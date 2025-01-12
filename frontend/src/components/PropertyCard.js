import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, MessageCircle, MapPin, Euro } from 'lucide-react';

const PropertyCard = ({ property, onLike, onMessage }) => {
    const { photos, location, price, property_type, property_description } = property;

    return (
        <Card className="w-full max-w-sm mx-auto">
            <div className="relative">
                <img
                    src={photos[0]}
                    alt="Property"
                    className="w-full h-64 object-cover rounded-t-lg"
                />
                <button
                    onClick={() => onLike(property.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
                >
                    <Heart className="w-6 h-6 text-red-500" />
                </button>
            </div>
            
            <CardContent className="p-4">
                <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-700">{location}</span>
                </div>
                
                <div className="flex items-center mb-4">
                    <Euro className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-lg font-bold">{price.toLocaleString()} EUR</span>
                </div>
                
                <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {property_type}
                    </span>
                </div>
                
                <p className="text-gray-600 line-clamp-3">
                    {property_description}
                </p>
            </CardContent>
            
            <CardFooter className="p-4 border-t">
                <div className="flex justify-between w-full">
                    <button
                        onClick={() => onMessage(property.id)}
                        className="flex items-center text-blue-600"
                    >
                        <MessageCircle className="w-5 h-5 mr-1" />
                        Contactează
                    </button>
                    
                    <button className="text-gray-600">
                        Vezi mai multe
                    </button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default PropertyCard;
