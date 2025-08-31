import React, { useState } from "react";
import "./SearchFilters.css";

const SearchFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    "Electronics",
    "Clothing",
    "Furniture",
    "Books",
    "Sports",
    "Other",
  ];

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ];

  const handleChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceChange = (type, value) => {
    const updatedFilters = {
      ...localFilters,
      [type]: value ? parseFloat(value) : "",
      page: 1,
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      sort: "newest",
      page: 1,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => key !== "page" && key !== "sort" && localFilters[key]
  );

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters">
            Clear All
          </button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          type="text"
          placeholder="Search products..."
          value={localFilters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select
          value={localFilters.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Condition</label>
        <select
          value={localFilters.condition || ""}
          onChange={(e) => handleChange("condition", e.target.value)}
          className="filter-select"
        >
          <option value="">Any Condition</option>
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Price Range</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={localFilters.minPrice || ""}
            onChange={(e) => handlePriceChange("minPrice", e.target.value)}
            className="price-input"
          />
          <span className="price-separator">-</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={localFilters.maxPrice || ""}
            onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
            className="price-input"
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Location</label>
        <input
          type="text"
          placeholder="City or state..."
          value={localFilters.location || ""}
          onChange={(e) => handleChange("location", e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Sort By</label>
        <select
          value={localFilters.sort || "newest"}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="filter-select"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;
