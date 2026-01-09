import { Heart, Target, BookOpen, Calendar, Search, MessageCircle, BarChart3, Info, Shield, Settings, HelpCircle, FileText } from "lucide-react";

export const navigationLinks = [
  {
    name: "Mood Feed",
    href: "/mood-feed",
    icon: Heart,
    description: "Share & connect",
  },
  {
    name: "Goals",
    href: "/goals",
    icon: Target,
    description: "Track progress",
  },
  {
    name: "Journal",
    href: "/journal",
    icon: BookOpen,
    description: "Private thoughts",
  },
  {
    name: "Events",
    href: "/events",
    icon: Calendar,
    description: "Join activities",
  },
  {
    name: "Explore",
    href: "/explore",
    icon: Search,
    description: "Find friends",
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageCircle,
    description: "Chat privately",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Mood insights",
  },
];

export const resourceLinks = [
  { name: "About", href: "/about", icon: Info },
  { name: "Privacy Policy", href: "/privacy", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "Terms", href: "/terms", icon: FileText },
];
