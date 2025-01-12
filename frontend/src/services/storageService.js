import { supabase } from '../config/supabase';

class StorageService {
    async uploadImage(file, userId) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `properties/${fileName}`;

            const { data, error } = await supabase.storage
                .from('property-images')
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteImage(filePath) {
        try {
            const { error } = await supabase.storage
                .from('property-images')
                .remove([filePath]);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
}

export default new StorageService();
