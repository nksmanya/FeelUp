'use client';

import Navbar from '../../components/Navbar';

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗓️ Events</h1>
          <p className="text-gray-600">Join wellness activities, study sessions, and community meetups.</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon!</h2>
          <p className="text-gray-600 mb-6">
            We're building an amazing events system where you can:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🧘</div>
              <h3 className="font-semibold">Wellness Events</h3>
              <p className="text-sm text-gray-600">Meditation sessions, yoga classes, mindfulness workshops</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold">Study Groups</h3>
              <p className="text-sm text-gray-600">Collaborative study sessions, focus rooms, academic support</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="font-semibold">Social Meetups</h3>
              <p className="text-sm text-gray-600">Local gatherings, virtual hangouts, community events</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">💪</div>
              <h3 className="font-semibold">Fitness Activities</h3>
              <p className="text-sm text-gray-600">Group workouts, walking clubs, sports events</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}