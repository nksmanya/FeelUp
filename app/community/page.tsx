'use client';

import Navbar from '../../components/Navbar';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤝 Community</h1>
          <p className="text-gray-600">Find companions, join friend circles, and build meaningful connections.</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Building Connections!</h2>
          <p className="text-gray-600 mb-6">
            Soon you'll be able to connect with like-minded people and create supportive communities:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold">Friend Circles</h3>
              <p className="text-sm text-gray-600">Create private groups for trusted sharing and support</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🧭</div>
              <h3 className="font-semibold">Companion Finder</h3>
              <p className="text-sm text-gray-600">Find study partners, gym buddies, and activity companions</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌱</div>
              <h3 className="font-semibold">Growth Challenges</h3>
              <p className="text-sm text-gray-600">Join weekly challenges with community support</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">💌</div>
              <h3 className="font-semibold">Support Networks</h3>
              <p className="text-sm text-gray-600">Connect with others on similar wellness journeys</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}