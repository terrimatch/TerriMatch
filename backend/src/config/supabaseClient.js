import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for database operations
export const createProfile = async (profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
    
    if (error) throw error
    return data[0]
}

export const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
    
    if (error) throw error
    return data[0]
}

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    
    if (error) throw error
    return data
}

export const getMatches = async (userId) => {
    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            user1:profiles!matches_user1_id_fkey(*),
            user2:profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'matched')
    
    if (error) throw error
    return data
}