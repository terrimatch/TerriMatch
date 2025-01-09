import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validate input
        if (!email || !password || !username) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        // Create auth user in Supabase
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
        });

        if (signUpError) throw signUpError;

        // Create profile in profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    username,
                    email,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ])
            .select()
            .single();

        if (profileError) throw profileError;

        // Return success response
        res.status(201).json({
            message: "Registration successful",
            user: {
                id: authData.user.id,
                username: profileData.username,
                email: profileData.email
            }
        });

    } catch (error) {
        // Handle specific error cases
        if (error.message.includes('unique constraint')) {
            return res.status(400).json({ 
                error: 'Email or username already exists' 
            });
        }

        res.status(500).json({ 
            error: 'Registration failed', 
            message: error.message 
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Attempt login with Supabase
        const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) throw loginError;

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;

        // Return user data and session
        res.json({
            message: "Login successful",
            session: authData.session,
            user: profile
        });

    } catch (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        res.status(500).json({ 
            error: 'Login failed', 
            message: error.message 
        });
    }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                error: 'Email is required' 
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) throw error;

        res.json({ 
            message: 'Password reset instructions sent to your email' 
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Password reset request failed', 
            message: error.message 
        });
    }
});

// Verify email with token
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ 
                error: 'Verification token is required' 
            });
        }

        const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
        });

        if (error) throw error;

        res.json({ 
            message: 'Email verified successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Email verification failed', 
            message: error.message 
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;

        res.json({ 
            message: 'Logged out successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Logout failed', 
            message: error.message 
        });
    }
});

export default router;
