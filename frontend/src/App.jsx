import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedCommentSection from "./EnhancedCommentSection";
import landingPage from "../src/assets/landing.png";

import {
  Mic,
  Upload,
  Trash2,
  MessageCircle,
  Share2,
  X,
  Facebook,
  LinkedinIcon,
  Twitter,
  Link2,
  CircleUserRound,
  Play,
  Pause,
  Check,
} from "lucide-react";
import api from "./api";

const Toast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-2 border-l-4 border-green-500 z-50"
  >
    <Check size={20} className="text-green-500" />
    <p className="text-gray-700">{message}</p>
    <button
      onClick={onClose}
      className="ml-2 text-gray-400 hover:text-gray-600"
    >
      <X size={16} />
    </button>
  </motion.div>
);

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
};
const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [posts, setPosts] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [isPlaying, setIsPlaying] = useState(null);
  const [title, setTitle] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const waveformRef = useRef(null);
  const recordingWaveformRef = useRef(null);
  const postsWaveformRefs = useRef({});
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchPosts();
    initRecordingWaveform();

    return () => {
      recordingWaveformRef.current?.destroy();
      Object.values(postsWaveformRefs.current).forEach((wavesurfer) =>
        wavesurfer?.destroy()
      );
    };
  }, []);

  useEffect(() => {
    if (audioURL && !waveformRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: "#preview-waveform",
        waveColor: "#ebb331",
        progressColor: "#6e551a",
        height: 100,
        cursorWidth: 1,
        barWidth: 2,
        barGap: 1,
        responsive: true,
      });
      waveformRef.current.load(audioURL);
    }
  }, [audioURL]);

  useEffect(() => {
    posts.forEach((post) => {
      if (!postsWaveformRefs.current[post.id]) {
        const wavesurfer = WaveSurfer.create({
          container: `#waveform-${post.id}`,
          waveColor: "#ebb331",
          progressColor: "#6e551a",
          height: 80,
          cursorWidth: 1,
          barWidth: 2,
          barGap: 1,
          responsive: true,
        });
        wavesurfer.load(post.audio);
        postsWaveformRefs.current[post.id] = wavesurfer;

        wavesurfer.on("finish", () => setIsPlaying(null));
      }
    });
  }, [posts]);

  const initRecordingWaveform = () => {
    recordingWaveformRef.current = WaveSurfer.create({
      container: "#recording-waveform",
      waveColor: "#4F46E5",
      progressColor: "#312E81",
      height: 100,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      responsive: true,
    });
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts/");
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const addComment = async (postId) => {
    if (!commentTexts[postId]?.trim()) return;
    try {
      const response = await api.post(`/posts/${postId}/comments/`, {
        text: commentTexts[postId],
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, response.data] }
            : post
        )
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_note.wav");
    formData.append("title", title);
    try {
      const response = await api.post("/posts/", formData);
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      setAudioURL(null);
      setAudioBlob(null);
      setTitle("");
      waveformRef.current?.destroy();
      waveformRef.current = null;
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const togglePlay = (postId) => {
    if (isPlaying === postId) {
      postsWaveformRefs.current[postId]?.pause();
      setIsPlaying(null);
    } else {
      if (isPlaying) {
        postsWaveformRefs.current[isPlaying]?.pause();
      }
      postsWaveformRefs.current[postId]?.play();
      setIsPlaying(postId);
    }
  };

  const handlePreviewPlay = () => {
    if (waveformRef.current) {
      if (waveformRef.current.isPlaying()) {
        waveformRef.current.pause();
      } else {
        waveformRef.current.play();
      }
    }
  };

  const handleShare = async (postId, platform) => {
    const postUrl = `${window.location.origin}/post/${postId}`;

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(postUrl);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000); // Hide after 2 seconds
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      setShowShareMenu(null);
      return;
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        postUrl
      )}&text=Check out this voice post!`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        postUrl
      )}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    setShowShareMenu(null);
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="relative h-[80vh] max-h-[600px] w-full">
        <img
          src={landingPage}
          alt="Landing Page"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(4px)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg"
          >
            Speak your sh*t
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
           className="text-xl text-black bg-yellow-200 bg-opacity-50 px-10 rounded"
          >
            There are no filters, do it anonymously!
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="w-full mb-6">
            <input
              type="text"
              placeholder="Give your voice note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              maxLength={50}
            />
            <p className="mt-1 text-sm text-gray-500 text-right">
              {title.length}/50 characters
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
              isRecording
                ? {
                    scale: [1, 1.1, 1],
                    borderRadius: ["50%", "45%", "50%"],
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.7)",
                      "0 0 0 20px rgba(239, 68, 68, 0)",
                    ],
                  }
                : {}
            }
            transition={
              isRecording
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : {}
            }
            className={`p-6 rounded-full ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white shadow-lg relative`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic size={32} className={isRecording ? "animate-pulse" : ""} />
          </motion.button>

          <div id="recording-waveform" className="w-full h-24 mt-4" />

          {audioURL && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-4 flex flex-col items-center"
            >
              <div id="preview-waveform" className="w-full" />
              <button
                onClick={handlePreviewPlay}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Preview
              </button>
              <div className="flex gap-4 mt-4">
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
                  onClick={uploadAudio}
                >
                  <Upload size={20} />
                  Share
                </button>

                <button
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
                  onClick={() => {
                    setAudioURL(null);
                    setAudioBlob(null);
                    waveformRef.current?.destroy();
                    waveformRef.current = null;
                  }}
                >
                  <Trash2 size={20} />
                  Delete
                </button>
              </div>
              {!title.trim() && (
                <p className="mt-2 text-red-500 text-sm">
                  Please add a title before sharing
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 space-y-6 p-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-4 mb-4">
              <CircleUserRound size={40} />

              <div>
                <p className="text-gray-500">Anonymous User</p>
                <p className="text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-400">
                  {formatTimestamp(post.created_at)}
                </p>
              </div>
            </div>

            <div id={`waveform-${post.id}`} className="w-full" />
            <button
              onClick={() => togglePlay(post.id)}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg"
            >
              {isPlaying === post.id ? <Pause /> : <Play />}
            </button>

            <div className="mt-4 flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                onClick={() =>
                  setExpandedPost(expandedPost === index ? null : index)
                }
              >
                <MessageCircle size={20} />
                Comments ({post.comments?.length || 0})
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                  onClick={() =>
                    setShowShareMenu(showShareMenu === post.id ? null : post.id)
                  }
                >
                  <Share2 size={20} />
                  Share
                </button>

                {showShareMenu === post.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-10"
                  >
                    <button
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleShare(post.id, "twitter")}
                    >
                      <Twitter size={18} />
                      Twitter
                    </button>
                    <button
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleShare(post.id, "facebook")}
                    >
                      <Facebook size={18} />
                      Facebook
                    </button>
                    <button
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleShare(post.id, "linkedin")}
                    >
                      <LinkedinIcon size={18} />
                      LinkedIn
                    </button>
                    <button
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleShare(post.id, "copy")}
                    >
                      <Link2 size={18} />
                      Copy Link
                    </button>
                  </motion.div>
                )}
                <AnimatePresence>
                  {showToast && (
                    <Toast
                      message="Link copied to clipboard!"
                      onClose={() => setShowToast(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {expandedPost === index && (
              <EnhancedCommentSection
                post={post}
                index={index}
                expandedPost={expandedPost}
                commentTexts={commentTexts}
                setCommentTexts={setCommentTexts}
                addComment={addComment}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default App;
