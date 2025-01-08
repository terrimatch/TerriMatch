import express from 'express';
import { supabase } from '../../config/supabase.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
