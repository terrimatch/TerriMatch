//... în funcția router.get('/potential'), actualizăm calculul scorului:

const calculateMatchScore = (currentUser, profile, preferences) => {
    let totalScore = 0;
    let totalWeight = 0;

    // Funcție helper pentru calculul scorului
    const addScore = (score, weight) => {
        totalScore += score * weight;
        totalWeight += weight;
    };

    // 1. Interese comune (weight: 3)
    if (preferences.interests?.length > 0 && profile.interests?.length > 0) {
        const commonInterests = profile.interests.filter(
            interest => preferences.interests.includes(interest)
        );
        const interestScore = commonInterests.length / preferences.interests.length;
        addScore(interestScore, 3);
    }

    // 2. Locație/Distanță (weight: 2.5)
    if (currentUser.latitude && currentUser.longitude && profile.latitude && profile.longitude) {
        const distance = calculateDistance(
            currentUser.latitude,
            currentUser.longitude,
            profile.latitude,
            profile.longitude
        );
        const maxDistance = preferences.distance || 50;
        const distanceScore = 1 - (distance / maxDistance);
        addScore(distanceScore, 2.5);
    }

    // 3. Obiective relaționale (weight: 4)
    if (preferences.relationshipGoals?.length > 0 && profile.relationship_goals) {
        const goalScore = preferences.relationshipGoals.includes(profile.relationship_goals) ? 1 : 0;
        addScore(goalScore, 4);
    }

    // 4. Limbi comune (weight: 2)
    if (preferences.languages?.length > 0 && profile.languages?.length > 0) {
        const commonLanguages = profile.languages.filter(
            lang => preferences.languages.includes(lang)
        );
        const languageScore = commonLanguages.length / preferences.languages.length;
        addScore(languageScore, 2);
    }

    // 5. Înălțime (weight: 1)
    if (preferences.heightRange && profile.height) {
        const heightInRange = profile.height >= preferences.heightRange.min && 
                            profile.height <= preferences.heightRange.max;
        addScore(heightInRange ? 1 : 0, 1);
    }

    // 6. Educație (weight: 2)
    if (preferences.educationLevel?.length > 0 && profile.education_level) {
        const educationScore = preferences.educationLevel.includes(profile.education_level) ? 1 : 0;
        addScore(educationScore, 2);
    }

    // 7. Stil de viață (weight: 2.5)
    if (preferences.lifestyle && profile.lifestyle) {
        let lifestyleMatches = 0;
        let lifestyleFactors = 0;
        
        const factors = ['smoking', 'drinking', 'exercise', 'diet'];
        factors.forEach(factor => {
            if (preferences.lifestyle[factor] && profile.lifestyle[factor]) {
                lifestyleFactors++;
                if (preferences.lifestyle[factor] === profile.lifestyle[factor]) {
                    lifestyleMatches++;
                }
            }
        });
        
        if (lifestyleFactors > 0) {
            const lifestyleScore = lifestyleMatches / lifestyleFactors;
            addScore(lifestyleScore, 2.5);
        }
    }

    // 8. Premium status bonus (weight: 0.5)
    if (profile.is_premium) {
        addScore(1, 0.5);
    }

    // Calculează scorul final (0-100)
    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 50;
};

// Actualizăm query-ul pentru a include noile câmpuri
let query = supabase
    .from('profiles')
    .select(`
        id,
        username,
        avatar_url,
        bio,
        gender,
        birth_date,
        interests,
        latitude,
        longitude,
        is_premium,
        boost_active_until,
        relationship_goals,
        languages,
        height,
        education_level,
        occupation,
        lifestyle
    `)
    .not('id', 'in', excludeIds);

// În secțiunea de calculare a match-urilor:
const matchesWithScore = filteredMatches.map(profile => ({
    ...profile,
    matchPercentage: calculateMatchScore(currentUser, profile, preferences)
}));
