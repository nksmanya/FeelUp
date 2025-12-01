'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

const communityFeatures = [
  {
    id: 'circles',
    title: 'Friend Circles',
    icon: '👥',
    description: 'Create private groups for trusted sharing and support',
    status: 'coming_soon',
    features: ['Private group sharing', 'Circle-only posts', 'Group challenges', 'Mutual support']
  },
  {
    id: 'finder',
    title: 'Companion Finder',
    icon: '🧭',
    description: 'Find people with similar wellness goals and interests',
    status: 'coming_soon', 
    features: ['Interest matching', 'Goal compatibility', 'Local connections', 'Safety verified']
  },
  {
    id: 'groups',
    title: 'Wellness Groups',
    icon: '🌱',
    description: 'Join topic-based communities for focused discussions',
    status: 'coming_soon',
    features: ['Mindfulness groups', 'Exercise buddies', 'Mental health support', 'Study groups']
  },
  {
    id: 'challenges',
    title: 'Community Challenges',
    icon: '🏆',
    description: 'Participate in group goals and friendly competitions',
    status: 'coming_soon',
    features: ['30-day challenges', 'Group streaks', 'Leaderboards', 'Celebration posts']
  }
];

const mockUsers = [
  { name: 'Sarah M.', avatar: '🌸', status: 'Focusing on mindfulness', streak: 12, common_goals: 3 },
  { name: 'Alex R.', avatar: '🌟', status: 'Building healthy habits', streak: 7, common_goals: 2 },
  { name: 'Jamie L.', avatar: '🍀', status: 'Study and wellness balance', streak: 15, common_goals: 4 },
  { name: 'Morgan K.', avatar: '🌙', status: 'Evening routine master', streak: 9, common_goals: 2 },
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [joinedCircles, setJoinedCircles] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to access the community</p>
            <button 
              onClick={() => router.push('/login')}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🤝 Community</h1>
          <p className="text-xl text-gray-600 mb-6">Find companions, join friend circles, and build meaningful connections</p>
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl p-2 soft-glow inline-flex">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔍 Discover
            </button>
            <button
              onClick={() => setActiveTab('circles')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'circles'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 My Circles
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'features'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🌟 Features
            </button>
          </div>
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 soft-glow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🧭 Find Your Wellness Companions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockUsers.map((person, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{person.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{person.status}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>🔥 {person.streak} day streak</span>
                          <span>🎯 {person.common_goals} common goals</span>
                        </div>
                      </div>
                      <button className="btn-secondary text-sm px-3 py-1">Connect</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-blue-800 font-medium mb-2">🚧 Coming Soon!</p>
                  <p className="text-blue-700">Smart matching based on your wellness goals, interests, and compatibility is in development.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Circles Tab */}
        {activeTab === 'circles' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 soft-glow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Your Friend Circles</h2>
              
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Circles Yet</h3>
                <p className="text-gray-600 mb-6">Create your first friend circle or join an existing one to start building meaningful connections.</p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  <button className="btn-primary w-full">
                    ➕ Create New Circle
                  </button>
                  <button className="btn-secondary w-full">
                    🔍 Find Circles to Join
                  </button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                <p className="text-yellow-800 font-medium mb-2">🛠️ Under Development</p>
                <p className="text-yellow-700">Friend Circles will allow you to create private groups for trusted sharing and mutual support.</p>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityFeatures.map((feature) => (
                <div key={feature.id} className="bg-white rounded-xl p-8 soft-glow">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-center">
                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                      Coming Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Building the Future of Wellness Community</h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                We're working hard to create meaningful features that foster genuine connections and mutual support. 
                Stay tuned for updates as we roll out these community features!
              </p>
              <button className="btn-primary">
                📧 Get Notified of Updates
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}