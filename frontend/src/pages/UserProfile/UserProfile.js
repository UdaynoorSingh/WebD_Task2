import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfilePhoto from '../../components/user/ProfilePhoto/ProfilePhoto';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: {
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      country: user?.location?.country || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <p>Manage your account settings and profile information</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <ProfilePhoto 
              size="large" 
              onUpdate={(updatedUser) => {
                setSuccess('Profile photo updated successfully!');
              }}
            />
            
            <div className="profile-stats">
              <h3>Account Stats</h3>
              <div className="stat-item">
                <span className="stat-label">Member since</span>
                <span className="stat-value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Role</span>
                <span className="stat-value">{user.role}</span>
              </div>
              {user.rating && (
                <div className="stat-item">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">{user.rating}/5</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-main">
            <form onSubmit={handleSubmit} className="profile-form">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <div className="form-section">
                <h3>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Tell us about yourself..."
                    maxLength="200"
                  />
                  <div className="character-count">
                    {formData.bio.length}/200 characters
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Location</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                      type="text"
                      id="city"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                      type="text"
                      id="state"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your state"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your country"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="small" message="" /> : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;