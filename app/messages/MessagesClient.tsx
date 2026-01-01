"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";

interface Message {
  id: string;
  sender_email: string;
  recipient_email: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  user_email: string;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  user_id: string;
}

const mockConversations: Conversation[] = [
  {
    user_email: "sarah.chen@example.com",
    user_name: "Sarah Chen",
    user_id: "1",
    last_message: "Thank you for the meditation tips! They really helped.",
    last_message_time: "2025-12-02T10:30:00.000Z",
    unread_count: 2,
  },
  {
    user_email: "alex.rodriguez@example.com",
    user_name: "Alex Rodriguez",
    user_id: "2",
    last_message: "Would love to join your study group!",
    last_message_time: "2025-12-01T15:45:00.000Z",
    unread_count: 0,
  },
  {
    user_email: "jamie.park@example.com",
    user_name: "Jamie Park",
    user_id: "3",
    last_message: "Your journal entry about creativity was inspiring ✨",
    last_message_time: "2025-12-01T09:15:00.000Z",
    unread_count: 1,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    sender_email: "sarah.chen@example.com",
    recipient_email: "user@example.com",
    content:
      "Hi! I saw your post about meditation and wanted to thank you for sharing those techniques.",
    created_at: "2025-12-02T10:00:00.000Z",
    is_read: true,
  },
  {
    id: "2",
    sender_email: "user@example.com",
    recipient_email: "sarah.chen@example.com",
    content:
      "You're welcome! I'm so glad they helped. Have you tried the breathing exercises too?",
    created_at: "2025-12-02T10:15:00.000Z",
    is_read: true,
  },
  {
    id: "3",
    sender_email: "sarah.chen@example.com",
    recipient_email: "user@example.com",
    content:
      "Yes! The 4-7-8 technique has been amazing for my anxiety. Thank you for the meditation tips! They really helped.",
    created_at: "2025-12-02T10:30:00.000Z",
    is_read: false,
  },
];

export default function MessagesClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user parameter is provided in URL
  const userParam = searchParams?.get("user");

  useEffect(() => {
    if (userParam) {
      const conversation = conversations.find(
        (conv) => conv.user_id === userParam,
      );
      if (conversation) {
        setSelectedConversation(conversation.user_email);
        loadMessages(conversation.user_email);
      }
    }
  }, [userParam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (userEmail: string) => {
    setLoading(true);
    try {
      // Mock loading messages for selected conversation
      const conversationMessages = mockMessages.filter(
        (msg) =>
          (msg.sender_email === userEmail &&
            msg.recipient_email === session?.user?.email) ||
          (msg.sender_email === session?.user?.email &&
            msg.recipient_email === userEmail),
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !session?.user?.email)
      return;

    try {
      const messageData = {
        sender_email: session.user.email,
        recipient_email: selectedConversation,
        content: newMessage.trim(),
      };

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const newMsg: Message = {
          id: Date.now().toString(),
          sender_email: session.user.email,
          recipient_email: selectedConversation,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
          is_read: false,
        };

        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");

        // Update conversation last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user_email === selectedConversation
              ? {
                  ...conv,
                  last_message: newMessage.trim(),
                  last_message_time: new Date().toISOString(),
                }
              : conv,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    return colors[name.length % colors.length];
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center bg-white rounded-xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Messages
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to connect and chat with community members
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Sign In to Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          style={{ height: "calc(100vh - 140px)" }}
        >
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  💬 Messages
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Stay connected with your wellness community
                </p>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.user_email}
                    onClick={() => {
                      setSelectedConversation(conversation.user_email);
                      loadMessages(conversation.user_email);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.user_email
                        ? "bg-purple-50 border-purple-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 ${getAvatarColor(conversation.user_name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
                      >
                        {conversation.user_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.user_name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conversation.last_message}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {conversation.unread_count} new
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {conversations.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">💭</div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start connecting with community members!
                    </p>
                    <button
                      onClick={() => router.push("/explore")}
                      className="btn-primary px-4 py-2 rounded-lg text-sm"
                    >
                      Explore Users
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${getAvatarColor(conversations.find((c) => c.user_email === selectedConversation)?.user_name || "")} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
                      >
                        {conversations
                          .find((c) => c.user_email === selectedConversation)
                          ?.user_name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-medium text-gray-900">
                          {
                            conversations.find(
                              (c) => c.user_email === selectedConversation,
                            )?.user_name
                          }
                        </h2>
                        <p className="text-sm text-gray-500">
                          Active in wellness community
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="text-gray-500">Loading messages...</div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_email === session.user?.email ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_email === session.user?.email
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender_email === session.user?.email
                                    ? "text-purple-200"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a positive message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Send
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💕 Keep conversations positive and supportive
                    </p>
                  </div>
                </>
              ) : (
                /* No Conversation Selected */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome to Messages
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Select a conversation to start chatting, or explore the
                      community to find new connections.
                    </p>
                    <button
                      onClick={() => router.push("/explore")}
                      className="btn-primary px-6 py-3 rounded-lg"
                    >
                      Find People to Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
