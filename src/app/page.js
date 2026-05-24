"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";

export default function Home() {

  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // =========================
  // FETCH MESSAGES
  // =========================

  async function fetchMessages() {

    try {

      const response =
        await API.get("/api/messages");

      const fetchedMessages =
        response.data.messages || [];

      setMessages(fetchedMessages);

      // AUTO SELECT LATEST CHAT

      if (
        fetchedMessages.length > 0 &&
        !selectedUser
      ) {

        setSelectedUser(
          fetchedMessages[
            fetchedMessages.length - 1
          ].userId
        );
      }

    } catch (error) {

      console.log("❌ Fetch Error");

      console.log(error);
    }
  }

  // =========================
  // SEND MESSAGE
  // =========================

  async function sendMessage() {

    if (
      !replyText.trim() ||
      !selectedUser
    ) return;

    try {

      setSending(true);

      // LOCAL MESSAGE

      const newMessage = {

        userId: selectedUser,

        sender: "admin",

        message: replyText,

        timestamp: new Date()
      };

      setMessages((prev) => [

        ...prev,

        newMessage
      ]);

      // BACKEND SAVE

      await API.post(
        "/api/send-message",

        {

          userId: selectedUser,

          message: replyText
        }
      );

      setReplyText("");

    } catch (error) {

      console.log(
        "❌ Send Error"
      );

      console.log(error);

    } finally {

      setSending(false);
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

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({

      behavior: "smooth"
    });

  }, [messages, selectedUser]);

  // =========================
  // GROUP CHATS
  // =========================

  const groupedChats = useMemo(() => {

    const grouped = {};

    messages.forEach((msg) => {

      if (!grouped[msg.userId]) {

        grouped[msg.userId] = [];
      }

      grouped[msg.userId].push(msg);
    });

    let chats = Object.entries(grouped)

      .map(([userId, userMessages]) => ({

        userId,

        messages: userMessages,

        unread:

          userMessages.filter(
            (m) => m.sender !== "admin"
          ).length,

        lastMessage:
          userMessages[userMessages.length - 1]
      }))

      .sort((a, b) =>

        new Date(
          b.lastMessage.timestamp
        ) -

        new Date(
          a.lastMessage.timestamp
        )
      );

    // SEARCH

    if (search.trim()) {

      chats = chats.filter((chat) =>

        chat.userId.includes(search)
      );
    }

    // FILTERS

    if (filter === "unread") {

      chats = chats.filter(

        (chat) => chat.unread > 0
      );
    }

    return chats;

  }, [messages, search, filter]);

  // =========================
  // ACTIVE CHAT
  // =========================

  const activeMessages =
    messages.filter(

      (msg) =>
        msg.userId === selectedUser
    );

  // =========================
  // RANDOM COLORS
  // =========================

  function getGradient(id) {

    const gradients = [

      "from-pink-500 to-orange-400",

      "from-green-400 to-emerald-600",

      "from-cyan-400 to-blue-600",

      "from-violet-500 to-purple-700",

      "from-yellow-400 to-orange-500",

      "from-rose-500 to-pink-700"
    ];

    const index =
      id.length % gradients.length;

    return gradients[index];
  }

  return (

    <main className="h-screen bg-[#0b141a] text-white flex overflow-hidden">

      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}

      <div className="w-[27%] min-w-[340px] bg-[#111b21] border-r border-[#1f2c34] flex flex-col">

        {/* HEADER */}

        <div className="h-20 px-5 border-b border-[#1f2c34] flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">

              Amina Inbox

            </h1>

            <div className="flex items-center gap-2 mt-2">

              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>

              <p className="text-sm text-green-400">

                AI Online

              </p>

            </div>

          </div>

          <button className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a884] to-[#005c4b] text-2xl shadow-2xl hover:scale-105 transition-all">

            ✨

          </button>

        </div>

        {/* SEARCH */}

        <div className="p-4 border-b border-[#1f2c34]">

          <div className="relative">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search conversations..."
              className="w-full bg-[#202c33] text-sm rounded-2xl px-5 py-4 pl-12 outline-none placeholder:text-gray-400"
            />

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">

              🔍

            </span>

          </div>

        </div>

        {/* FILTERS */}

        <div className="flex gap-3 px-4 py-3 border-b border-[#1f2c34] overflow-x-auto">

          <button
            onClick={() =>
              setFilter("all")
            }
            className={`

              text-sm px-4 py-2 rounded-full whitespace-nowrap transition

              ${filter === "all"

                ? "bg-[#00a884] text-black font-semibold"

                : "bg-[#202c33] hover:bg-[#2a3942]"
              }
            `}
          >

            All Chats

          </button>

          <button
            onClick={() =>
              setFilter("unread")
            }
            className={`

              text-sm px-4 py-2 rounded-full whitespace-nowrap transition

              ${filter === "unread"

                ? "bg-[#00a884] text-black font-semibold"

                : "bg-[#202c33] hover:bg-[#2a3942]"
              }
            `}
          >

            Unread

          </button>

          <button className="bg-[#202c33] hover:bg-[#2a3942] transition text-sm px-4 py-2 rounded-full whitespace-nowrap">

            AI Active

          </button>

        </div>

        {/* CHAT LIST */}

        <div className="flex-1 overflow-y-auto">

          {groupedChats.map((chat, index) => (

            <div
              key={index}
              onClick={() =>
                setSelectedUser(chat.userId)
              }
              className={`

                px-4 py-4
                cursor-pointer
                border-b border-[#1f2c34]
                transition-all duration-300

                hover:bg-[#202c33]

                ${selectedUser === chat.userId
                  ? "bg-[#202c33]"
                  : ""
                }
              `}
            >

              <div className="flex gap-4 items-center">

                {/* AVATAR */}

                <div className="relative">

                  <div className={`

                    w-16 h-16 rounded-full
                    bg-gradient-to-br
                    ${getGradient(chat.userId)}

                    overflow-hidden
                    shadow-2xl
                  `}>

                    <img
                      src={`https://ui-avatars.com/api/?name=${chat.userId}&background=random`}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />

                  </div>

                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-[#111b21]"></div>

                </div>

                {/* INFO */}

                <div className="flex-1 min-w-0">

                  <div className="flex justify-between items-center">

                    <h2 className="font-semibold text-[16px] truncate">

                      {chat.userId}

                    </h2>

                    <span className="text-xs text-gray-400">

                      {new Date(
                        chat.lastMessage.timestamp
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}

                    </span>

                  </div>

                  <div className="flex items-center justify-between mt-2">

                    <p className="text-sm text-gray-400 truncate max-w-[220px]">

                      {chat.lastMessage.message}

                    </p>

                    {chat.unread > 0 && (

                      <div className="bg-[#00a884] text-black text-xs font-bold min-w-[24px] h-[24px] rounded-full flex items-center justify-center ml-3">

                        {chat.unread}

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* ========================= */}
      {/* CHAT AREA */}
      {/* ========================= */}

      <div className="flex-1 flex flex-col bg-[#0b141a] relative">

        {/* HEADER */}

        <div className="h-20 border-b border-[#1f2c34] bg-[#202c33]/80 backdrop-blur-xl px-6 flex items-center justify-between z-20">

          {selectedUser ? (

            <div className="flex items-center gap-4">

              <div className="relative">

                <img
                  src={`https://ui-avatars.com/api/?name=${selectedUser}&background=random`}
                  alt="profile"
                  className="w-14 h-14 rounded-full object-cover shadow-xl"
                />

                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-[#202c33] animate-pulse"></div>

              </div>

              <div>

                <h2 className="font-semibold text-lg">

                  {selectedUser}

                </h2>

                <div className="flex items-center gap-2 mt-1">

                  <span className="text-xs bg-[#00a884]/20 text-green-400 px-3 py-1 rounded-full">

                    AI Enabled

                  </span>

                  <span className="text-sm text-gray-300">

                    online
                  </span>

                </div>

              </div>

            </div>

          ) : (

            <div>

              <h2 className="text-xl font-semibold">

                Select a chat

              </h2>

            </div>
          )}

          {/* ACTIONS */}

          <div className="flex gap-3">

            <button className="w-12 h-12 rounded-full bg-[#111b21] hover:bg-[#2a3942] transition text-lg">

              📞

            </button>

            <button className="w-12 h-12 rounded-full bg-[#111b21] hover:bg-[#2a3942] transition text-lg">

              ⚡

            </button>

            <button className="w-12 h-12 rounded-full bg-[#111b21] hover:bg-[#2a3942] transition text-lg">

              ⋮

            </button>

          </div>

        </div>

        {/* WALLPAPER */}

        <div className="absolute inset-0 opacity-[0.035] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {/* MESSAGES */}

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 relative z-10">

          {activeMessages.length === 0 ? (

            <div className="h-full flex flex-col items-center justify-center text-center">

              <div className="w-36 h-36 rounded-full bg-[#202c33]/70 flex items-center justify-center text-6xl shadow-2xl">

                💬

              </div>

              <h1 className="text-5xl mt-10 font-bold">

                Welcome to Amina Inbox

              </h1>

            </div>

          ) : (

            activeMessages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${msg.sender === "admin" || msg.sender === "ai"
                  ? "justify-end"
                  : "justify-start"
                }`}
              >

                <div
                  className={`

                    max-w-[70%]
                    px-5 py-4
                    rounded-[28px]
                    shadow-2xl
                    text-sm
                    transition-all duration-300

                    ${msg.sender === "admin" || msg.sender === "ai"

                      ? "bg-gradient-to-r from-[#005c4b] to-[#007561]"

                      : "bg-[#202c33]"
                    }
                  `}
                >

                  <p className="leading-relaxed text-[15px]">

                    {msg.message}

                  </p>

                  <div className="flex justify-end items-center gap-2 mt-3">

                    <span className="text-[11px] text-gray-300">

                      {new Date(
                        msg.timestamp
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}

                    </span>

                    {(msg.sender === "admin" || msg.sender === "ai") && (

                      <span className="text-blue-300 text-xs">

                        ✓✓

                      </span>
                    )}

                  </div>

                </div>

              </div>
            ))
          )}

          <div ref={messagesEndRef}></div>

        </div>

        {/* INPUT */}

        <div className="p-5 border-t border-[#1f2c34] bg-[#111b21]/90 backdrop-blur-xl relative z-10">

          <div className="flex items-center gap-3">

            <button className="w-14 h-14 rounded-full bg-[#202c33] hover:bg-[#2a3942] transition text-xl">

              😊

            </button>

            <button className="w-14 h-14 rounded-full bg-[#202c33] hover:bg-[#2a3942] transition text-xl">

              📎

            </button>

            <input
              type="text"
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-[#202c33]/90 rounded-full px-7 py-5 outline-none placeholder:text-gray-400 text-[15px]"
            />

            <button className="px-6 h-14 rounded-full bg-[#202c33] hover:bg-[#2a3942] transition font-semibold">

              AI

            </button>

            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-gradient-to-r from-[#00a884] to-[#06cf9c] hover:scale-105 transition-all px-10 h-14 rounded-full font-bold shadow-2xl text-black disabled:opacity-50"
            >

              {sending
                ? "Sending..."
                : "Send"
              }

            </button>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* CRM PANEL */}
      {/* ========================= */}

      <div className="w-[22%] min-w-[320px] bg-[#111b21] border-l border-[#1f2c34] hidden xl:flex flex-col">

        <div className="h-20 border-b border-[#1f2c34] flex items-center px-6 justify-between">

          <h2 className="text-2xl font-bold">

            Customer Info

          </h2>

          <button className="w-10 h-10 rounded-full bg-[#202c33] hover:bg-[#2a3942] transition">

            ⚙️

          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {selectedUser ? (

            <>

              <div className="flex flex-col items-center text-center">

                <img
                  src={`https://ui-avatars.com/api/?name=${selectedUser}&background=random`}
                  alt="profile"
                  className="w-28 h-28 rounded-full object-cover shadow-2xl"
                />

                <h2 className="mt-5 text-2xl font-bold">

                  {selectedUser}

                </h2>

                <div className="flex items-center gap-2 mt-3">

                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>

                  <p className="text-green-400">

                    Premium Customer

                  </p>

                </div>

              </div>

              {/* TAGS */}

              <div className="flex flex-wrap gap-2 mt-6 justify-center">

                <span className="bg-[#202c33] px-4 py-2 rounded-full text-sm">

                  VIP

                </span>

                <span className="bg-[#202c33] px-4 py-2 rounded-full text-sm">

                  AI Lead

                </span>

                <span className="bg-[#202c33] px-4 py-2 rounded-full text-sm">

                  Active

                </span>

              </div>

              {/* CARDS */}

              <div className="mt-8 space-y-4">

                <div className="bg-[#202c33] rounded-3xl p-5">

                  <p className="text-sm text-gray-400">

                    AI Status

                  </p>

                  <h3 className="mt-2 font-semibold text-green-400 text-lg">

                    Active & Responding

                  </h3>

                </div>

                <div className="bg-[#202c33] rounded-3xl p-5">

                  <p className="text-sm text-gray-400">

                    Total Messages

                  </p>

                  <h3 className="mt-2 font-semibold text-lg">

                    {activeMessages.length}

                  </h3>

                </div>

                <div className="bg-[#202c33] rounded-3xl p-5">

                  <p className="text-sm text-gray-400">

                    Last Active

                  </p>

                  <h3 className="mt-2 font-semibold text-lg">

                    Just Now

                  </h3>

                </div>

                <div className="bg-[#202c33] rounded-3xl p-5">

                  <p className="text-sm text-gray-400">

                    Lead Score

                  </p>

                  <div className="mt-3 w-full bg-[#111b21] rounded-full h-3 overflow-hidden">

                    <div className="w-[82%] h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"></div>

                  </div>

                  <p className="mt-3 text-green-400 font-semibold">

                    82% High Potential

                  </p>

                </div>

                <div className="bg-[#202c33] rounded-3xl p-5">

                  <p className="text-sm text-gray-400">

                    AI Notes

                  </p>

                  <p className="mt-3 text-sm text-gray-300 leading-relaxed">

                    Highly engaged customer.
                    Recommend premium collection suggestions
                    and fast replies.

                  </p>

                </div>

              </div>

            </>

          ) : (

            <div className="h-full flex items-center justify-center text-center text-gray-500">

              Select a customer

            </div>
          )}

        </div>

      </div>

    </main>
  );
}