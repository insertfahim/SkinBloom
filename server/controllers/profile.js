import Profile from '../models/Profile.js'

export async function upsertProfile(req, res) {
  console.log('Creating/updating profile for user:', req.user.id);
  console.log('Profile data:', req.body);
  
  try {
    const {
      skinType,
      age,
      gender,
      allergies,
      concerns,
      skinGoals,
      consultationPhotos,
      dermatologistRecommended,
      notes,
      photo
    } = req.body;

    // Validate required fields
    if (!skinType || !age || !gender) {
      return res.status(400).json({
        error: 'Skin type, age, and gender are required'
      });
    }

    // Create a clean profile data object (removed currentProducts)
    const profileData = {
      userId: req.user.id,
      skinType: skinType,
      age: parseInt(age),
      gender: gender,
      allergies: Array.isArray(allergies) ? allergies : [],
      concerns: Array.isArray(concerns) ? concerns : [],
      skinGoals: Array.isArray(skinGoals) ? skinGoals : [],
      dermatologistRecommended: Boolean(dermatologistRecommended),
      notes: notes || '',
      photo: photo || ''
    };

    // Handle consultationPhotos
    if (consultationPhotos && Array.isArray(consultationPhotos)) {
      profileData.consultationPhotos = consultationPhotos.map(photo => {
        if (typeof photo === 'object' && photo !== null) {
          return {
            url: String(photo.url || ''),
            uploadDate: photo.uploadDate ? new Date(photo.uploadDate) : new Date(),
            concerns: Array.isArray(photo.concerns) ? photo.concerns : [],
            notes: String(photo.notes || '')
          };
        }
        return {
          url: '',
          uploadDate: new Date(),
          concerns: [],
          notes: ''
        };
      });
    } else {
      profileData.consultationPhotos = [];
    }

    console.log('Final profile data to save:', profileData);

    // Use findOneAndUpdate with upsert
    const savedProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { 
        upsert: true, 
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: 'Profile saved successfully',
      profile: savedProfile
    });
  } catch (e) { 
    console.error('Profile error:', e);
    res.status(500).json({ error: e.message }) 
  }
}

export async function getMyProfile(req, res) {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (e) { 
    console.error('Get profile error:', e);
    res.status(500).json({ error: e.message }) 
  }
}