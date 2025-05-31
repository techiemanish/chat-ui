import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
    <div className="mt-4 bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <label>User ID: </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="ml-2 border p-1"
          >
            <option value="manish">manish</option>
            <option value="user">user</option>
          </select>
          <label className="ml-4">Talking To: </label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="ml-2 border p-1"
          >
            <option value="manish">manish</option>
            <option value="user">user</option>
          </select>
        </div>
        <div className="h-64 overflow-y-auto border p-2 mb-2 rounded">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 my-1 rounded ${msg.senderId === userId ? 'bg-blue-100 text-right' : 'bg-green-200 text-left'}`}
            >
              {/* <strong>{msg.senderId}:</strong>  */}{msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {typing && (
          <div className="text-sm italic mb-1 text-gray-500">
            User is typing...
          </div>
        )}
        <div className="flex">
          <input
            className="flex-grow border rounded-l px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            disabled={!props.indicator}
            className={`px-4 rounded-r ${
              props.indicator
                ? "bg-blue-500 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;