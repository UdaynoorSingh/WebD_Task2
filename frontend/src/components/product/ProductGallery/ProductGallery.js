import React, { useState } from "react";
import "./ProductGallery.css";

const ProductGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads/")) {
      return `http://localhost:5000${imagePath}`;
    }
    return "/images/placeholder.png";
  };
  if (!images || images.length === 0) {
    return (
      <div className="product-gallery">
        <div className="main-image">
          <img
            src="/images/placeholder.png"
            alt="No image available"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="main-image">
        <img
          src={getImageUrl(images[selectedImage])}
          alt={`Product view ${selectedImage + 1}`}
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.src = "/images/placeholder.png";
          }}
        />
      </div>

      {images.length > 1 && (
        <div className="thumbnail-container">
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === selectedImage ? "active" : ""}`}
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
