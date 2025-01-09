import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')

        if (error) {
            throw error
        }

        console.log('Successfully connected to Supabase!')
        console.log('Data:', data)
    } catch (error) {
        console.error('Error connecting to Supabase:', error.message)
    }
}

testConnection()