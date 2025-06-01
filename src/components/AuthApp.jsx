import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock user data - replace with actual API calls
const mockUsers = [
  { id: '1', username: 'manish', name: 'Manish Tiwari' },
  { id: '2', username: 'john', name: 'John Doe' },
  { id: '3', username: 'bob', name: 'Bob Johnson' },
];

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });
  const navigate = useNavigate();

  const toggleAuthMode = () => setIsLogin(!isLogin);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Replace with actual API call
    if (isLogin) {
      // Login logic
      console.log('Logging in with:', formData);
      setIsAuthenticated(true);
    } else {
      // Signup logic
      console.log('Signing up with:', formData);
      setIsAuthenticated(true);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Replace with actual API call
    console.log('Searching for:', searchQuery);
  };

  const startChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            <p><b>Note: </b>In development, You can login by entering anything!!</p>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Find Users to Chat</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name"
              className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition duration-200"
            >
              Search
            </button>
          </div>
        </form>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="p-4 font-semibold border-b">Available Users</h2>
          <div className="divide-y">
            {mockUsers
              .filter(user => 
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(user => (
                <div 
                  key={user.id} 
                  className="p-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => startChat(user.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition duration-200"
                  >
                    Chat
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthApp;