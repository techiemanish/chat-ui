import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [userId, setUserId] = useState('manish'); // switch to user to simulate chat
  const [receiverId, setReceiverId] = useState('user');
  const stompClientRef = useRef(null);
  const timeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('https://chat-api-9q8j.onrender.com/ws-chat');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe('/topic/messages', (msg) => {
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
    if (input.trim() !== '') {
      const message = {
        senderId: userId,
        receiverId: receiverId,
        content: input,
        type: 'CHAT',
      };
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
      });
      setInput('');
    }
  };

  const handleTyping = () => {
    if (!typing) setTyping(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(false), 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="mb-4">
        <label>User ID: </label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="ml-2 border p-1">
          <option value="manish">manish</option>
          <option value="user">user</option>
        </select>
        <label className="ml-4">Talking To: </label>
        <select value={receiverId} onChange={(e) => setReceiverId(e.target.value)} className="ml-2 border p-1">
          <option value="manish">manish</option>
          <option value="user">user</option>
        </select>
      </div>
      <div className="h-64 overflow-y-auto border p-2 mb-2 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 my-1 rounded \${msg.senderId === userId ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}>
            <strong>{msg.senderId}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {typing && <div className="text-sm italic mb-1 text-gray-500">User is typing...</div>}
      <div className="flex">
        <input
          className="flex-grow border rounded-l px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button className="bg-blue-500 text-white px-4 rounded-r" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
