"use client";

import { useEffect, useState } from "react";
import API from "../services/api";

export default function Home() {

  const [messages, setMessages] = useState([]);

  // =========================
  // FETCH CHATS
  // =========================

  async function fetchMessages() {

    try {

      const response =
        await API.get("/api/messages");

      setMessages(
        response.data.messages || []
      );

    } catch (error) {

      console.log(
        "❌ Fetch Error"
      );

      console.log(error);
    }
  }

  // =========================
  // AUTO REFRESH
  // =========================

  useEffect(() => {

    fetchMessages();

    const interval = setInterval(() => {

      fetchMessages();

    }, 3000);

    return () => clearInterval(interval);

  }, []);

  return (

    <main className="h-screen bg-[#111b21] text-white flex">

      {/* SIDEBAR */}

      <div className="w-[35%] border-r border-gray-800 bg-[#202c33]">

        <div className="h-16 border-b border-gray-800 flex items-center px-4">

          <h1 className="text-xl font-semibold">

            Amina Inbox

          </h1>

        </div>

        {/* CUSTOMER LIST */}

        <div className="overflow-y-auto h-[calc(100vh-64px)]">

          {messages.map((msg, index) => (

            <div
              key={index}
              className="p-4 border-b border-gray-800 hover:bg-[#2a3942] cursor-pointer"
            >

              <div className="flex justify-between">

                <h2 className="font-semibold">

                  {msg.userId}

                </h2>

                <span className="text-xs text-gray-400">

                  {new Date(
                   msg.timestamp
                  ).toLocaleTimeString()}

                </span>

              </div>

              <p className="text-sm text-gray-400 mt-1 truncate">

                {msg.message}

              </p>

            </div>
          ))}

        </div>

      </div>

      {/* CHAT AREA */}

      <div className="flex-1 flex items-center justify-center bg-[#0b141a]">

        <h1 className="text-2xl text-gray-500">

          Select a chat

        </h1>

      </div>

    </main>
  );
}