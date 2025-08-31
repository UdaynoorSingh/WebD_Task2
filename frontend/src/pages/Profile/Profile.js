import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./Profile.css";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile(user._id);
        setProfile(response.user);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("image", avatarFile);
    try {
      const res = await userService.uploadAvatar(formData);
      setProfile((prev) => ({ ...prev, avatar: res.imageUrl }));
      setUser((prev) => ({ ...prev, avatar: res.imageUrl }));
      setAvatarFile(null);
    } catch (err) {
      setError("Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile)
    return (
      <div className="container">
        <h2>Profile not found</h2>
      </div>
    );

  return (
    <div className="profile-page container">
      <h1>Profile</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="profile-info">
        <img
          src={
            profile.avatar && profile.avatar.startsWith("/uploads/")
              ? `http://localhost:5000${profile.avatar}`
              : profile.avatar || "/images/user-avatar.png"
          }
          alt={profile.name}
          className="profile-avatar"
          crossOrigin="anonymous"
        />
        <div className="profile-details">
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <p>{profile.bio}</p>
        </div>
      </div>
      <div className="avatar-upload-section">
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <button
          className="btn btn-primary"
          onClick={handleAvatarUpload}
          disabled={avatarUploading || !avatarFile}
        >
          {avatarUploading ? "Uploading..." : "Upload Profile Photo"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
