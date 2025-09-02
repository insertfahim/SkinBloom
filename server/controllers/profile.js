import Profile from '../models/Profile.js'

export async function upsertProfile(req,res){
  try{
    const userId = req.user.id;
    const {
      skinType,
      age,
      gender,
      allergies,
      concerns,
      skinGoals,
      currentProducts,
      consultationPhotos,
      dermatologistRecommended,
      notes,
      photo
    } = req.body;

    console.log('Creating/updating profile for user:', userId);
    console.log('Profile data:', req.body);

    // Validate required fields
    if (!skinType || !age || !gender) {
      return res.status(400).json({
        error: 'Skin type, age, and gender are required'
      });
    }

    // Ensure arrays are properly formatted
    const safeArrays = {
      allergies: Array.isArray(allergies) ? allergies : [],
      concerns: Array.isArray(concerns) ? concerns : [],
      skinGoals: Array.isArray(skinGoals) ? skinGoals : [],
      currentProducts: Array.isArray(currentProducts) ? currentProducts : [],
      consultationPhotos: Array.isArray(consultationPhotos) ? consultationPhotos : []
    };

    const data = { 
      userId,
      skinType,
      age: parseInt(age),
      gender,
      ...safeArrays,
      dermatologistRecommended: Boolean(dermatologistRecommended),
      notes: notes || '',
      photo: photo || null
    };

    // Delete any existing profile to avoid conflicts
    await Profile.deleteOne({ userId: req.user.id });
    
    // Create new profile
    const profile = new Profile(data);
    await profile.save();

    res.json({
      message: 'Profile saved successfully',
      profile
    });
  }catch(e){ 
    console.error('Profile error:', e);
    res.status(500).json({error: e.message}) 
  }
}

export async function getMyProfile(req,res){
  try{
    const profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  }catch(e){ 
    console.error('Get profile error:', e);
    res.status(500).json({error: e.message}) 
  }
}