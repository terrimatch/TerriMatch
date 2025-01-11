const { createClient } = require('@supabase/supabase-js');

// Verificăm existența variabilelor de mediu necesare
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase credentials missing in environment variables');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
);

// Funcție helper pentru verificarea conexiunii
const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
        if (error) throw error;
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection failed:', error.message);
        return false;
    }
};

module.exports = {
    supabase,
    testConnection
};
