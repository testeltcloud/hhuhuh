import { createContext, useContext, useState, useEffect } from 'react';
import { profilesService } from '../services/profilesService';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profilesService.getAll();
      setProfiles(data);
      
      // Check localStorage for last used profile
      const lastProfileId = localStorage.getItem('currentProfileId');
      if (lastProfileId) {
        const lastProfile = data.find(p => p.id === lastProfileId);
        if (lastProfile) {
          setCurrentProfile(lastProfile);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = (profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('currentProfileId', profile.id);
  };

  const createProfile = async (profileData) => {
    const newProfile = await profilesService.create(profileData);
    setProfiles(prev => [newProfile, ...prev]);
    return newProfile;
  };

  const deleteProfile = async (id) => {
    await profilesService.delete(id);
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (currentProfile?.id === id) {
      setCurrentProfile(null);
      localStorage.removeItem('currentProfileId');
    }
  };

  const logout = () => {
    setCurrentProfile(null);
    localStorage.removeItem('currentProfileId');
  };

  return (
    <ProfileContext.Provider value={{
      profiles,
      currentProfile,
      loading,
      selectProfile,
      createProfile,
      deleteProfile,
      logout,
      loadProfiles
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
