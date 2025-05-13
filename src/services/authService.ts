
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ExtendedUser, UserProfile } from "@/types/user";
import { fetchUserProfile, getUserPointsAndLevel, updateUserProfile } from "./profileService";

// Function to enhance the user object with profile data
export const enhanceUserWithProfile = async (supabaseUser: User | null): Promise<ExtendedUser | null> => {
  if (!supabaseUser) return null;

  try {
    const profile = await fetchUserProfile(supabaseUser.id);
    const { points, level } = await getUserPointsAndLevel(supabaseUser.id);

    const enhancedUser: ExtendedUser = {
      ...supabaseUser,
      profile,
      // Add convenience properties
      name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      username: profile?.username || supabaseUser.email?.split('@')[0] || 'user',  // Added username property
      avatar: profile?.avatar_url || '/placeholder.svg',
      points,
      level,
      role: profile?.role || 'user',
      app_metadata: supabaseUser.app_metadata || {}
    };

    return enhancedUser;
  } catch (error) {
    console.error("Error enhancing user:", error);
    // Provide default values if profile fetch fails
    return {
      ...supabaseUser,
      name: supabaseUser.email?.split('@')[0] || 'User',
      username: supabaseUser.email?.split('@')[0] || 'user',  // Added username property
      avatar: '/placeholder.svg',
      points: 0,
      level: 'bronze',
      role: 'user',
      app_metadata: supabaseUser.app_metadata || {}
    } as ExtendedUser;
  }
};

// Function to update user profile
export const updateUserProfileData = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    return await updateUserProfile(userId, profileData);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data;
};

export const signUp = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
