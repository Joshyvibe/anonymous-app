import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, CircleUserRound } from 'lucide-react';

const EnhancedCommentSection = ({ post, index, expandedPost, commentTexts, setCommentTexts, addComment }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
 
  const commonEmojis = ['😊', '❤️', '👍', '😂', '🎉', '👏', '🔥', '💯', '🤔', '😍'];
  
  const addEmoji = (emoji) => {
    setCommentTexts((prev) => ({
      ...prev,
      [post.id]: (prev[post.id] || '') + emoji
    }));
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return expandedPost === index ? (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4"
    >
      <div className="space-y-4">
        {post.comments?.map((comment, i) => (
          <div key={i} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <CircleUserRound className="text-gray-400" size={20} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Anonymous</span>
                  <span className="text-gray-500 text-sm">
                    • {formatTimestamp(comment.created_at)}
                  </span>
                </div>
                
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-4 py-3 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a comment..."
              value={commentTexts[post.id] || ""}
              onChange={(e) =>
                setCommentTexts((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="Add emoji"
              >
                <Smile size={20} />
              </button>
    
            </div>
          </div>
          
          <button
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => addComment(post.id)}
          >
            <Send size={20} />
          </button>
        </div>
        
        {showEmojiPicker && (
          <div className="absolute mt-2 bg-white p-3 rounded-lg shadow-lg border z-50">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl hover:bg-gray-100 p-1 rounded cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  ) : null;
};

export default EnhancedCommentSection;