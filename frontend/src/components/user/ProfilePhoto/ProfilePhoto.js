import React, { useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { uploadService } from "../../../services/uploadService";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import "./ProfilePhoto.css";

const ProfilePhoto = ({ onUpdate, size = "medium", editable = true }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await uploadService.uploadProfilePhoto(file);
      updateUser(response.user);
      if (onUpdate) onUpdate(response.user);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload profile photo");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await uploadService.deleteProfilePhoto();
      updateUser(response.user);
      if (onUpdate) onUpdate(response.user);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove profile photo");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/user-avatar.png";

    if (imagePath.startsWith("http")) return imagePath;

    if (imagePath.startsWith("/uploads/")) {
      return `http://localhost:5000${imagePath}`;
    }

    return imagePath;
  };

  return (
    <div className="profile-photo-container">
      <div className={`profile-photo ${size} ${editable ? "editable" : ""}`}>
        <img
          src={getImageUrl(user?.avatar)}
          alt="Profile"
          className="profile-image"
          onError={(e) => {
            e.target.src = "/images/user-avatar.png";
          }}
        />

        {editable && (
          <>
            {loading && (
              <div className="profile-photo-overlay">
                <LoadingSpinner size="small" message="" />
              </div>
            )}

            <div className="profile-photo-actions always-visible">
              <label className="upload-btn prominent-upload-btn">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span role="img" aria-label="camera">
                    📷
                  </span>{" "}
                  <span>Change Photo</span>
                </span>
              </label>
              {user?.avatar && user.avatar !== "/images/user-avatar.png" && (
                <button
                  className="remove-btn"
                  onClick={handleRemovePhoto}
                  disabled={loading}
                >
                  ❌ Remove
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ProfilePhoto;
