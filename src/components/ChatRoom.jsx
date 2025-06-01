import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ScrollToTop from "./ScrollToTop";

const ChatRoom = (props) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [userId, setUserId] = useState("manish");
  const [receiverId, setReceiverId] = useState("user");
  const stompClientRef = useRef(null);
  const timeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load initial messages when component mounts or users change
    const loadInitialMessages = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`https://chat-api-9q8j.onrender.com/api/messages/${userId}/${receiverId}`),
          fetch(`https://chat-api-9q8j.onrender.com/api/messages/${receiverId}/${userId}`)
        ]);
        
        const [messages1, messages2] = await Promise.all([
          res1.json(),
          res2.json()
        ]);
        
        const combinedMessages = [...messages1, ...messages2];
        const sortedMessages = combinedMessages.sort((a, b) => 
          new Date(a.timestamp || a.createdAt || 0) - new Date(b.timestamp || b.createdAt || 0)
        );
        
        setMessages(sortedMessages);
      } catch (error) {
        console.error("Failed to load message history:", error);
      }
    };

    loadInitialMessages();

    const socket = new SockJS("https://chat-api-9q8j.onrender.com/ws-chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe("/topic/messages", (msg) => {
          const message = JSON.parse(msg.body);
          if (
            (message.senderId === userId && message.receiverId === receiverId) ||
            (message.senderId === receiverId && message.receiverId === userId)
          ) {
            setMessages((prev) => [...prev, message]);
          }
        });
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => stompClient.deactivate();
  }, [userId, receiverId]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const message = {
        senderId: userId,
        receiverId: receiverId,
        content: input,
        type: "CHAT",
      };
      stompClientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(message),
      });
      setInput("");
    }
  };

  const handleTyping = () => {
    if (!typing) setTyping(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(false), 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
    <ScrollToTop/>
  <div className="flex justify-center items-start p-4 bg-gray-100 h-screen">
    <div className="w-full max-w-md mt-5">
      <div className="bg-white rounded-xl shadow-lg p-4">
        {/* User Selection */}
        <div className="flex flex-col space-y-2 mb-4 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID:</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="manish">manish</option>
              <option value="user">user</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Talking To:</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="manish">manish</option>
              <option value="user">user</option>
            </select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 my-1 rounded-lg max-w-[80%] ${
                msg.senderId === userId 
                  ? 'ml-auto bg-blue-100 text-right rounded-br-none' 
                  : 'mr-auto bg-green-200 text-left rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typing && (
          <div className="text-sm italic mb-2 text-gray-500 px-2">
            User is typing...
          </div>
        )}

        {/* Message Input */}
        <div className="flex">
          <input
            className="flex-grow border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            disabled={!props.indicator}
            className={`px-4 py-2 rounded-r-lg ${
              props.indicator
                ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
  </>
);
};

export default ChatRoom;