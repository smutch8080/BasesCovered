import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, Moon, Globe, Check, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import { PageLayout } from '../components/layout/PageLayout';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showProfileToTeammates: boolean;
    showProfileToPublic: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    showProfileToTeammates: true,
    showProfileToPublic: false
  }
};

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userSettingsRef = doc(db, 'user_settings', currentUser.id);
        const userSettingsDoc = await getDoc(userSettingsRef);
        
        if (userSettingsDoc.exists()) {
          setSettings({
            ...defaultSettings,
            ...userSettingsDoc.data() as UserSettings
          });
        } else {
          // If user settings don't exist yet, create with defaults
          await setDoc(userSettingsRef, defaultSettings);
          console.log('Created default user settings');
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [currentUser]);

  // Auto-save settings whenever they change
  useEffect(() => {
    // Skip initial render and when loading
    if (loading) return;
    
    const saveSettingsDebounced = setTimeout(() => {
      saveSettings();
    }, 500); // 500ms debounce to avoid too many writes
    
    return () => clearTimeout(saveSettingsDebounced);
  }, [settings]);

  const saveSettings = async () => {
    if (!currentUser || loading) return;
    
    try {
      setSaving(true);
      
      // 1. Save to user_settings collection
      const userSettingsRef = doc(db, 'user_settings', currentUser.id);
      await setDoc(userSettingsRef, {
        theme: settings.theme,
        language: settings.language,
        notifications: settings.notifications,
        privacy: settings.privacy
      });
      
      // 2. Update notification preferences in user's profile
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        'notificationPreferences.push': settings.notifications.push,
        'notificationPreferences.email': settings.notifications.email,
        'notificationPreferences.sms': settings.notifications.sms
      });
      
      // Only show toast on error, not on every save
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
  };

  const handleNotificationToggle = (type: 'email' | 'push' | 'sms') => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyToggle = (setting: 'showProfileToTeammates' | 'showProfileToPublic') => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting]
      }
    }));
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">App Settings</h1>
          {saving && <span className="text-sm text-gray-500">Saving changes...</span>}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Appearance Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Moon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Theme</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={settings.theme === 'light' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('light')}
                      className={settings.theme === 'light' ? 'bg-blue-500 text-white' : ''}
                    >
                      Light
                      {settings.theme === 'light' && <Check className="ml-1 w-4 h-4" />}
                    </Button>
                    <Button 
                      variant={settings.theme === 'dark' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('dark')}
                      className={settings.theme === 'dark' ? 'bg-blue-500 text-white' : ''}
                    >
                      Dark
                      {settings.theme === 'dark' && <Check className="ml-1 w-4 h-4" />}
                    </Button>
                    <Button 
                      variant={settings.theme === 'system' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('system')}
                      className={settings.theme === 'system' ? 'bg-blue-500 text-white' : ''}
                    >
                      System
                      {settings.theme === 'system' && <Check className="ml-1 w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Language Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                <h2 className="text-xl font-semibold">Language</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Preferred Language</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={settings.language === 'en' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleLanguageChange('en')}
                      className={settings.language === 'en' ? 'bg-blue-500 text-white' : ''}
                    >
                      English
                      {settings.language === 'en' && <Check className="ml-1 w-4 h-4" />}
                    </Button>
                    <Button 
                      variant={settings.language === 'es' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleLanguageChange('es')}
                      className={settings.language === 'es' ? 'bg-blue-500 text-white' : ''}
                    >
                      Español
                      {settings.language === 'es' && <Check className="ml-1 w-4 h-4" />}
                    </Button>
                    <Button 
                      variant={settings.language === 'fr' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleLanguageChange('fr')}
                      className={settings.language === 'fr' ? 'bg-blue-500 text-white' : ''}
                    >
                      Français
                      {settings.language === 'fr' && <Check className="ml-1 w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Basic Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationToggle('email')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via browser notifications</p>
                  </div>
                  <Switch 
                    id="push-notifications"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationToggle('push')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Receive text message updates</p>
                  </div>
                  <Switch 
                    id="sms-notifications"
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationToggle('sms')}
                  />
                </div>
                
                {/* Detailed notification settings component */}
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium mb-4">Push Notification Settings</p>
                  <NotificationSettings 
                    isPushEnabled={settings.notifications.push}
                    onPushToggle={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            
            {/* Privacy Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                <h2 className="text-xl font-semibold">Privacy</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Profile to Team Members</p>
                    <p className="text-sm text-gray-500">Allow teammates to view your full profile</p>
                  </div>
                  <Switch 
                    id="show-profile-teammates"
                    checked={settings.privacy.showProfileToTeammates}
                    onChange={() => handlePrivacyToggle('showProfileToTeammates')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-sm text-gray-500">Make your profile visible to everyone</p>
                  </div>
                  <Switch 
                    id="show-profile-public"
                    checked={settings.privacy.showProfileToPublic}
                    onChange={() => handlePrivacyToggle('showProfileToPublic')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 