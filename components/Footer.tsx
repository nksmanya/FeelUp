'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About FeelUp', href: '/about' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Support', href: '/support' },
    { name: 'Community Guidelines', href: '/community-guidelines' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                Feel<span className="text-purple-600">Up</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Building a more positive and supportive world through wellness tracking and meaningful connections.
            </p>
            <div className="flex space-x-4">
              <span className="text-2xl">🌟</span>
              <span className="text-2xl">💖</span>
              <span className="text-2xl">🌈</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/mood-feed" className="hover:text-blue-600 transition-colors">Mood Feed</Link></li>
              <li><Link href="/goals" className="hover:text-blue-600 transition-colors">Daily Goals</Link></li>
              <li><Link href="/journal" className="hover:text-blue-600 transition-colors">Wellness Journal</Link></li>
              <li><Link href="/analytics" className="hover:text-blue-600 transition-colors">Analytics</Link></li>
              <li><Link href="/community" className="hover:text-blue-600 transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/profile" className="hover:text-blue-600 transition-colors">Your Profile</Link></li>
              <li><Link href="/achievements" className="hover:text-blue-600 transition-colors">Achievements</Link></li>
              <li><Link href="/settings" className="hover:text-blue-600 transition-colors">Settings</Link></li>
              <li><span className="text-gray-400">Premium (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support & Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {currentYear} FeelUp. Made with 💙 for your wellness journey.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>🔒 Privacy Focused</span>
            <span>🌱 Wellness First</span>
            <span>🤝 Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
}