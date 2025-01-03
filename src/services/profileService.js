// src/services/profileService.js
import { connectTelegramUser } from './telegramService';

export const updateProfile = async (profileData) => {
 try {
   // Simulăm un apel API
   const response = await fetch('http://localhost:3001/api/profile/update', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(profileData)
   });
   
   return await response.json();
 } catch (error) {
   console.error('Error updating profile:', error);
   return { success: false, error: error.message };
 }
};

export const getProfile = async (userId) => {
 try {
   const response = await fetch(`http://localhost:3001/api/profile/${userId}`);
   return await response.json();
 } catch (error) {
   console.error('Error fetching profile:', error);
   return { success: false, error: error.message };
 }
};

export const uploadProfileImage = async (file, userId) => {
 try {
   const formData = new FormData();
   formData.append('image', file);
   formData.append('userId', userId);

   const response = await fetch('http://localhost:3001/api/profile/upload-image', {
     method: 'POST',
     body: formData
   });

   return await response.json();
 } catch (error) {
   console.error('Error uploading image:', error);
   return { success: false, error: error.message };
 }
};

export const updatePrivacySettings = async (userId, settings) => {
 try {
   const response = await fetch('http://localhost:3001/api/profile/privacy', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       userId,
       settings
     })
   });

   return await response.json();
 } catch (error) {
   console.error('Error updating privacy settings:', error);
   return { success: false, error: error.message };
 }
};

export const verifyProfile = async (userId, telegramUsername) => {
 try {
   // Verifică conexiunea cu Telegram
   const telegramConnection = await connectTelegramUser(userId, telegramUsername);
   
   if (!telegramConnection.success) {
     throw new Error('Verificarea Telegram a eșuat');
   }

   const response = await fetch('http://localhost:3001/api/profile/verify', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       userId,
       telegramUsername
     })
   });

   return await response.json();
 } catch (error) {
   console.error('Error verifying profile:', error);
   return { success: false, error: error.message };
 }
};

export const getProfileStats = async (userId) => {
 try {
   const response = await fetch(`http://localhost:3001/api/profile/stats/${userId}`);
   const stats = await response.json();
   
   return {
     success: true,
     data: {
       views: stats.views || 0,
       likes: stats.likes || 0,
       matches: stats.matches || 0,
       rating: stats.rating || 0,
       reviewCount: stats.reviewCount || 0,
       completedServices: stats.completedServices || 0,
     }
   };
 } catch (error) {
   console.error('Error fetching profile stats:', error);
   return { 
     success: false, 
     error: error.message,
     data: {
       views: 0,
       likes: 0,
       matches: 0,
       rating: 0,
       reviewCount: 0,
       completedServices: 0,
     }
   };
 }
};

export const reportProfile = async (reportedUserId, reason, details) => {
 try {
   const response = await fetch('http://localhost:3001/api/profile/report', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       reportedUserId,
       reason,
       details
     })
   });

   return await response.json();
 } catch (error) {
   console.error('Error reporting profile:', error);
   return { success: false, error: error.message };
 }
};

export const blockProfile = async (userId, blockedUserId) => {
 try {
   const response = await fetch('http://localhost:3001/api/profile/block', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       userId,
       blockedUserId
     })
   });

   return await response.json();
 } catch (error) {
   console.error('Error blocking profile:', error);
   return { success: false, error: error.message };
 }
};