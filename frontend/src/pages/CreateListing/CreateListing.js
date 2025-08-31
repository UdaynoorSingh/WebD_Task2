import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../services/productService";
import { uploadService } from "../../services/uploadService";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./CreateListing.css";

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    condition: "Like New",
    quantity: "1",
    tags: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Electronics",
    "Clothing",
    "Furniture",
    "Books",
    "Sports",
    "Other",
  ];
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + uploadedImageUrls.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const newImagePreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newImagePreviews]);

      const uploadResponse = await uploadService.uploadImages(files);
      setUploadedImageUrls((prev) => [...prev, ...uploadResponse.imageUrls]);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadResponse.imageUrls],
      }));
    } catch (err) {
      setError("Failed to upload images. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newUrls = [...uploadedImageUrls];
    newUrls.splice(index, 1);
    setUploadedImageUrls(newUrls);

    setFormData((prev) => ({
      ...prev,
      images: newUrls,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.images.length === 0) {
      setError("Please upload at least one image");
      setLoading(false);
      return;
    }

    try {
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        quantity: parseInt(formData.quantity),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        images: formData.images,
      };

      await productService.createProduct(submissionData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to create listing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login", { state: { from: "/create-listing" } });
    return null;
  }

  return (
    <div className="create-listing">
      <div className="container">
        <div className="create-listing-header">
          <h1>Create New Listing</h1>
          <p>Sell your pre-loved items to our community</p>
        </div>

        <form onSubmit={handleSubmit} className="listing-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>Product Information</h3>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
                placeholder="Enter product name"
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                required
                rows="4"
                placeholder="Describe your product in detail..."
                maxLength="1000"
              />
              <div className="character-count">
                {formData.description.length}/1000 characters
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition" className="form-label">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="originalPrice" className="form-label">
                  Original Price ($)
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                  step="0.01"
                  placeholder="0.00 (optional)"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-control"
                  required
                  min="1"
                  placeholder="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="tag1, tag2, tag3 (comma separated)"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product Images</h3>
            <div className="image-upload">
              <label htmlFor="images" className="upload-label">
                <div className="upload-area">
                  {uploading ? (
                    <LoadingSpinner size="small" message="Uploading..." />
                  ) : (
                    <>
                      <span className="upload-icon">📷</span>
                      <p>Click to upload images</p>
                      <small>
                        Maximum 5 images (first image will be the main image)
                      </small>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  className="file-input"
                  multiple
                  accept="image/*"
                  disabled={uploading}
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img
                        src={
                          preview.startsWith("http")
                            ? preview
                            : preview.startsWith("/uploads/")
                            ? `http://localhost:5000${preview}`
                            : "/images/placeholder.png"
                        }
                        alt={`Preview ${index + 1}`}
                        crossOrigin="anonymous"
                        onError={(e) => {
                          if (uploadedImageUrls[index]) {
                            e.target.src = `http://localhost:5000${uploadedImageUrls[index]}`;
                          } else {
                            e.target.src = "/images/placeholder.png";
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || uploading}
            >
              {loading ? (
                <LoadingSpinner size="small" message="" />
              ) : (
                "Create Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
