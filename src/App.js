import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import AuthApp from './components/AuthApp';

function App() {
  const [flag, setFlag] = useState(false);
  const [initialMessages, setInitialMessages] = useState([]);
  
  useEffect(() => {
    // First check API health
    fetch('https://chat-api-9q8j.onrender.com/')
      .then((response) => {
        if(response.ok) {
          setFlag(true);
          // If API is healthy, fetch message history
          return Promise.all([
            fetch('https://chat-api-9q8j.onrender.com/api/messages/user/manish'),
            fetch('https://chat-api-9q8j.onrender.com/api/messages/manish/user')
          ]);
        }
        throw new Error('API not healthy');
      })
      .then((responses) => Promise.all(responses.map(res => res.json())))
      .then(([messages1, messages2]) => {
        // Combine both message arrays
        setInitialMessages([...messages1, ...messages2]);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  return (
    <Router>
      {/* <div className="min-h-screen bg-gray-100 p-4"> */}
        <Routes>
          {/* <Route path="/" element={<AuthApp />} /> */}
          <Route path="/" element={<ChatRoom indicator={flag} initialMessages={initialMessages} />} />
          {/* <Route 
            path="/chat/:userId" 
            element={<ChatRoom indicator={flag} initialMessages={initialMessages} />} 
          /> */}
        </Routes>
      {/* </div> */}
    </Router>
  );
}

export default App;