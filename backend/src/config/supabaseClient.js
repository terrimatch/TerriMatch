import { supabase } from '../config/supabaseClient.js'

const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .single()

        if (error) throw error

        console.log('Successfully connected to Supabase!')
        console.log('Number of profiles:', data.count)
    } catch (error) {
        console.error('Error connecting to Supabase:', error.message)
    }
}

testConnection()