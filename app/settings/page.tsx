"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    privacy_level: 'public',
    theme: 'default',
    email_updates: true,
    streak_reminders: true,
    mood_tracking: true
  });
  const router = useRouter();

  const saveSettings = async () => {
    if (!user?.email) return;
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          privacy_level: settings.privacy_level,
          theme: settings.theme
        })
      });
      
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      return;
    }
    
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      
      if (res.ok) {
        await signOut({ redirect: false });
        router.push('/');
        alert('Account deleted successfully');
      } else {
        alert('Failed to delete account');
      }
    } catch (e) {
      alert('Failed to delete account');
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      setUser(session.user);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 soft-glow">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ Settings</h1>
          
          {/* Privacy Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                <select
                  value={settings.privacy_level}
                  onChange={(e) => setSettings(prev => ({ ...prev, privacy_level: e.target.value }))}
                  className="input-field"
                >
                  <option value="public">Public - Anyone can see your profile</option>
                  <option value="friends">Friends - Only friends can see your profile</option>
                  <option value="private">Private - Only you can see your profile</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-gray-600">Receive notifications for reactions and comments</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Updates</div>
                  <div className="text-sm text-gray-600">Weekly summary and important updates</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_updates}
                    onChange={(e) => setSettings(prev => ({ ...prev, email_updates: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Streak Reminders</div>
                  <div className="text-sm text-gray-600">Daily reminders to maintain your streak</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.streak_reminders}
                    onChange={(e) => setSettings(prev => ({ ...prev, streak_reminders: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">App Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                  className="input-field"
                >
                  <option value="default">Default - Light and calming</option>
                  <option value="minimal">Minimal - Clean and simple</option>
                  <option value="colorful">Colorful - Bright and energetic</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Mood Tracking</div>
                  <div className="text-sm text-gray-600">Enable mood tracking features</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.mood_tracking}
                    onChange={(e) => setSettings(prev => ({ ...prev, mood_tracking: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={saveSettings}
              className="btn-primary w-full"
            >
              💾 Save Settings
            </button>
            
            <div className="border-t pt-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
              
              <button
                onClick={handleSignOut}
                className="btn-secondary w-full"
              >
                🚪 Sign Out
              </button>
              
              <button
                onClick={deleteAccount}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}