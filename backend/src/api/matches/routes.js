import express from 'express';
import { supabase } from '../../config/supabase.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// Get potential matches
router.get('/potential', auth, async (req, res) => {
  try {
    const { data: userPreferences } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('user_id', req.userId)
      .single();

    // Get potential matches based on preferences
    const { data: matches, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', req.userId)
      // Add your matching logic here
      .limit(20);

    if (error) throw error;

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a profile
router.post('/like/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    const { data, error } = await supabase
      .from('likes')
      .insert([
        { 
          from_user: req.userId,
          to_user: profileId,
          created_at: new Date()
        }
      ]);

    if (error) throw error;

    // Check if it's a match
    const { data: matchData, error: matchError } = await supabase
      .from('likes')
      .select('*')
      .eq('from_user', profileId)
      .eq('to_user', req.userId)
      .single();

    if (matchError && matchError.code !== 'PGRST116') throw matchError;

    if (matchData) {
      // It's a match! Create match record
      const { error: newMatchError } = await supabase
        .from('matches')
        .insert([
          {
            user1_id: req.userId,
            user2_id: profileId,
            created_at: new Date()
          }
        ]);

      if (newMatchError) throw newMatchError;

      res.json({ match: true, matchData });
    } else {
      res.json({ match: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
