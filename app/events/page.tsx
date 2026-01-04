"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { Calendar, Heart, BookOpen, Users, Dumbbell, Star, Plus, Check, Clock, MapPin, User, BarChart3 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  category: "wellness" | "study" | "social" | "fitness";
  date: string;
  time: string;
  duration: string;
  location: string;
  isVirtual: boolean;
  organizer: string;
  organizerAvatar: string;
  attendees: number;
  maxAttendees?: number;
  tags: string[];
  rsvpStatus?: "going" | "interested" | "not-going";
  difficulty?: "beginner" | "intermediate" | "advanced";
  price?: number;
  image?: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Morning Mindfulness Meditation",
    description:
      "Start your day with clarity and intention. Join us for a guided meditation session focusing on breath awareness and setting positive intentions for the day ahead.",
    category: "wellness",
    date: "2025-12-03",
    time: "07:00",
    duration: "45 min",
    location: "Wellness Studio A",
    isVirtual: false,
    organizer: "Sarah Chen",
    organizerAvatar: "🧘‍♀️",
    attendees: 12,
    maxAttendees: 20,
    tags: ["meditation", "mindfulness", "morning", "beginner-friendly"],
    difficulty: "beginner",
    price: 0,
  },
  {
    id: "2",
    title: "Study Group: Advanced Psychology",
    description:
      "Collaborative study session for Psychology 301. We'll review cognitive behavioral therapy concepts and prepare for the upcoming midterm exam.",
    category: "study",
    date: "2025-12-03",
    time: "14:00",
    duration: "2 hours",
    location: "Library Study Room 3",
    isVirtual: false,
    organizer: "Alex Rodriguez",
    organizerAvatar: "📚",
    attendees: 6,
    maxAttendees: 8,
    tags: ["psychology", "study group", "exam prep", "academic"],
    price: 0,
  },
  {
    id: "3",
    title: "Virtual Coffee & Chat",
    description:
      "Casual virtual meetup for students to connect, share experiences, and support each other. Bring your favorite beverage and join the conversation!",
    category: "social",
    date: "2025-12-03",
    time: "19:00",
    duration: "1 hour",
    location: "Zoom Meeting",
    isVirtual: true,
    organizer: "Jamie Park",
    organizerAvatar: "☕",
    attendees: 18,
    maxAttendees: 25,
    tags: ["social", "virtual", "networking", "casual"],
    price: 0,
  },
  {
    id: "4",
    title: "HIIT Fitness Bootcamp",
    description:
      "High-intensity interval training session designed to boost your energy and fitness levels. All fitness levels welcome with modifications available.",
    category: "fitness",
    date: "2025-12-04",
    time: "18:00",
    duration: "1 hour",
    location: "Campus Gym",
    isVirtual: false,
    organizer: "Marcus Johnson",
    organizerAvatar: "💪",
    attendees: 15,
    maxAttendees: 20,
    tags: ["fitness", "HIIT", "cardio", "strength"],
    difficulty: "intermediate",
    price: 5,
  },
  {
    id: "5",
    title: "Stress Management Workshop",
    description:
      "Learn practical techniques for managing academic and life stress. Topics include time management, relaxation techniques, and building resilience.",
    category: "wellness",
    date: "2025-12-05",
    time: "16:00",
    duration: "1.5 hours",
    location: "Student Center Room 201",
    isVirtual: false,
    organizer: "Dr. Lisa Wong",
    organizerAvatar: "🌱",
    attendees: 22,
    maxAttendees: 30,
    tags: ["stress management", "workshop", "mental health", "skills"],
    difficulty: "beginner",
    price: 0,
  },
  {
    id: "6",
    title: "Weekend Hiking Adventure",
    description:
      "Explore local trails and connect with nature. A moderate 5-mile hike with beautiful scenic views. Perfect for clearing your mind and getting active!",
    category: "fitness",
    date: "2025-12-07",
    time: "09:00",
    duration: "4 hours",
    location: "Riverside Trail",
    isVirtual: false,
    organizer: "Emma Davis",
    organizerAvatar: "🥾",
    attendees: 8,
    maxAttendees: 15,
    tags: ["hiking", "nature", "outdoor", "weekend"],
    difficulty: "intermediate",
    price: 0,
  },
];

export default function EventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [rsvpEvents, setRsvpEvents] = useState<Set<string>>(new Set());

  const categories = [
    { id: "all", label: "All Events", icon: Star, count: events.length },
    {
      id: "wellness",
      label: "Wellness",
      icon: Heart,
      count: events.filter((e) => e.category === "wellness").length,
    },
    {
      id: "study",
      label: "Study Groups",
      icon: BookOpen,
      count: events.filter((e) => e.category === "study").length,
    },
    {
      id: "social",
      label: "Social",
      icon: Users,
      count: events.filter((e) => e.category === "social").length,
    },
    {
      id: "fitness",
      label: "Fitness",
      icon: Dumbbell,
      count: events.filter((e) => e.category === "fitness").length,
    },
  ];

  useEffect(() => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory,
      );
    }

    // Filter by date
    if (selectedDate !== "all") {
      const today = new Date().toISOString().split("T")[0];
      switch (selectedDate) {
        case "today":
          filtered = filtered.filter((event) => event.date === today);
          break;
        case "tomorrow":
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          filtered = filtered.filter((event) => event.date === tomorrowStr);
          break;
        case "this-week":
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= new Date() && eventDate <= weekFromNow;
          });
          break;
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredEvents(filtered);
  }, [selectedCategory, selectedDate, searchQuery, events]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "wellness":
        return "bg-purple-100 text-purple-700";
      case "study":
        return "bg-blue-100 text-blue-700";
      case "social":
        return "bg-green-100 text-green-700";
      case "fitness":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleRSVP = (
    eventId: string,
    status: "going" | "interested" | "not-going",
  ) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              rsvpStatus: status,
              attendees:
                status === "going"
                  ? event.rsvpStatus === "going"
                    ? event.attendees
                    : event.attendees + 1
                  : event.rsvpStatus === "going"
                    ? event.attendees - 1
                    : event.attendees,
            }
          : event,
      ),
    );

    if (status === "going") {
      setRsvpEvents((prev) => new Set([...prev, eventId]));
    } else {
      setRsvpEvents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-800 mb-4">🗓️ Events</h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Join wellness activities, study sessions, and community meetups to
            enhance your well-being and connect with others
          </p>

          {session && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary px-6 py-3 rounded-lg text-white font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <option key={category.id} value={category.id}>
                      {category.label} ({category.count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.label}
                <span className="text-sm opacity-75">
                  ({category.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Event Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}
                  >
                    {event.category}
                  </span>
                  {event.price !== undefined && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.price === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.price === 0 ? "Free" : `$${event.price}`}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.isVirtual ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>by {event.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.attendees} attending
                      {event.maxAttendees &&
                        ` (${event.maxAttendees - event.attendees} spots left)`}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {event.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{event.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* RSVP Buttons */}
                <div className="mt-6 space-y-2">
                  {session ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRSVP(event.id, "going")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          event.rsvpStatus === "going"
                            ? "bg-green-600 text-white"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        ✓ Going
                      </button>
                      <button
                        onClick={() => handleRSVP(event.id, "interested")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          event.rsvpStatus === "interested"
                            ? "bg-yellow-600 text-white"
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}
                      >
                        ⭐ Interested
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Sign In to RSVP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Events Found */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms to find events that
              match your interests.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedDate("all");
                setSearchQuery("");
              }}
              className="btn-secondary px-6 py-2 rounded-lg"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Create Event CTA */}
        {!session && (
          <div className="bg-linear-to-r from-purple-100 to-pink-100 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want to Create Your Own Event?
            </h2>
            <p className="text-gray-700 mb-6">
              Sign in to create and organize events for the community. Share
              your expertise and bring people together!
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Sign In to Create Events
            </button>
          </div>
        )}

        {/* Upcoming Events Summary */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Event Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {events.length}
              </div>
              <div className="text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {
                  events.filter(
                    (e) => e.date === new Date().toISOString().split("T")[0],
                  ).length
                }
              </div>
              <div className="text-gray-600">Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {session ? rsvpEvents.size : 0}
              </div>
              <div className="text-gray-600">Your RSVPs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {events.filter((e) => e.price === 0).length}
              </div>
              <div className="text-gray-600">Free Events</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
