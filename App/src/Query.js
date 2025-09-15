
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Save, User, Bot, X } from 'lucide-react';

const QueryPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingLLM, setSavingLLM] = useState(false);
  const [llmName, setLLMName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(userStr);
    setUser(userObj);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          userEmail: user?.email,
          history: conversations 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(prev => [...prev, {
          question: query,
          answer: data.response, // Changed from data.answer to data.response
          timestamp: new Date().toISOString()
        }]);
        setQuery('');
      } else {
        setConversations(prev => [...prev, {
          question: query,
          answer: 'Error getting response',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setConversations(prev => [...prev, {
        question: query,
        answer: 'Error connecting to server',
        timestamp: new Date().toISOString()
      }]);
    }
    setLoading(false);
  };

  const handleSaveLLM = async () => {
    if (!llmName.trim()) return;
    
    setSavingLLM(true);
    try {
      const response = await fetch('http://localhost:5000/save-llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          llmName: llmName,
          userEmail: user.email
        }),
      });

      if (response.ok) {
        alert('LLM saved successfully!');
        setShowSaveDialog(false);
        setLLMName('');
        navigate('/dashboard');
      } else {
        alert('Error saving LLM');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving LLM');
    }
    setSavingLLM(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8 pt-4"
        >
          <Link 
            to="/upload"
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="mr-2" />
            Back to Upload
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSaveDialog(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full flex items-center shadow-lg transition-colors"
          >
            <Save className="mr-2" size={20} />
            Save AI Assistant
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Test Your AI Assistant</h1>
          <p className="text-lg text-gray-100">Ask questions and get context-specific answers</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="mb-8"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question"
              className="flex-1 px-6 py-3 rounded-full bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !query.trim()}
              className={`px-8 py-3 rounded-full flex items-center ${
                loading || !query.trim() 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-white text-purple-600 hover:bg-gray-100'
              } shadow-lg`}
            >
              {loading ? 'Thinking...' : 'Ask'}
              <Send className="ml-2" size={20} />
            </motion.button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white bg-opacity-10 rounded-lg p-4 h-[600px] overflow-y-auto backdrop-blur-sm"
        >
          {conversations.length === 0 ? (
            <div className="text-center text-gray-300 py-10">
              No questions asked yet. Start by typing a question above!
            </div>
          ) : (
            conversations.map((conv, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className="bg-white bg-opacity-20 rounded-lg p-5 mb-4"
              >
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-white mb-1">{conv.question}</p>
                      <p className="text-sm text-gray-300">
                        {new Date(conv.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <p className="text-white whitespace-pre-wrap">{conv.answer}</p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Save LLM Modal */}
      {showSaveDialog && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-96 text-gray-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Save AI Assistant</h3>
              <button 
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={llmName}
              onChange={(e) => setLLMName(e.target.value)}
              placeholder="Enter assistant name"
              className="w-full px-4 py-2 rounded-full border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveLLM}
                disabled={savingLLM || !llmName.trim()}
                className={`px-6 py-2 rounded-full text-white ${
                  savingLLM || !llmName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {savingLLM ? 'Saving...' : 'Save'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};


export default QueryPage;
