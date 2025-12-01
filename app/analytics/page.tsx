'use client';

import Navbar from '../../components/Navbar';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics</h1>
          <p className="text-gray-600">Discover insights about your mood patterns and wellness journey.</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Journey Insights!</h2>
          <p className="text-gray-600 mb-6">
            We're creating powerful analytics to help you understand your wellness patterns:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold">Mood Tracker</h3>
              <p className="text-sm text-gray-600">Visual charts showing your emotional trends over time</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold">Goal Analytics</h3>
              <p className="text-sm text-gray-600">Track completion rates and identify patterns</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="font-semibold">Emotional Insights</h3>
              <p className="text-sm text-gray-600">AI-powered summaries of your wellness journey</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">⏳</div>
              <h3 className="font-semibold">Memory Lane</h3>
              <p className="text-sm text-gray-600">Timeline view of your growth and achievements</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}