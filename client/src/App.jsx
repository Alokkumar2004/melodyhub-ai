import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomPlayer from './components/BottomPlayer';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './App.css';
import PlaylistView from './pages/PlaylistView';
import LikedSongs from './pages/LikedSongs';
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/playlist/:id" element={<PlaylistView />} />
          <Route path="/liked" element={<LikedSongs />} />
        </Routes>
      </div>
      
      {/* 
        ✨ MOVED OUTSIDE ROUTES! 
        Now it will float on top of every page in the bottom right corner.
      */}
      <AIChatbot /> 

      <BottomPlayer />
      <MobileNav />
    </div>
  );
}

export default App;