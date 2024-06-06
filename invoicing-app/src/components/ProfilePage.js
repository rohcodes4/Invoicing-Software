import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    
    if (user) {
      axios.get(`http://localhost:5000/api/profile/`)
        .then(res => setProfile(res.data))
        .catch(err => console.log(err));
    }
  }, [user]);

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <div className="profile-info">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Company:</strong> {profile.company}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Address:</strong> {profile.address}</p>
        {/* Add other fields as necessary */}
      </div>
    </div>
  );
};

export default ProfilePage;
