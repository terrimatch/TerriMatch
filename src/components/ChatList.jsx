import React, { useState } from 'react';
import { Clock, Star } from 'lucide-react';

export default function ChatList() {
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Ana M.",
      image: "/profiles/1.jpg",
      lastMessage: "Ne vedem mai târziu?",
      time: "12:30",
      unread: 2,
      online: true,
      rating: 4.9,
      type: "provider"
    },
    {
      id: 2,
      name: "Maria D.",
      image: "/profiles/2.jpg",
      lastMessage: "Mulțumesc pentru conversație",
      time: "11:45",
      unread: 0,
      online: false,
      rating: 4.8,
      type: "regular"
    },
    // Poți adăuga mai multe conversații aici
  ]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Conversații</h2>
      </div>

      {/* Lista de chat-uri */}
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            className="p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={chat.image}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{chat.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {chat.online ? (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Online acum
                        </span>
                      ) : (
                        <span>Ultima dată: {chat.time}</span>
                      )}
                      {chat.type === 'provider' && (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          {chat.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">{chat.time}</span>
                    {chat.unread > 0 && (
                      <span className="mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 truncate mt-1">
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search sau filtre - opțional */}
      <div className="p-3 border-t">
        <input
          type="text"
          placeholder="Caută conversații..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}