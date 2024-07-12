// src/components/FilterForm.jsx
import React, { useState } from 'react';

const FilterForm = ({ onSubmit }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ minPrice, maxPrice, sortBy });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Min Price:
        <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
      </label>
      <label>
        Max Price:
        <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </label>
      <label>
        Sort By:
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">--Select--</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </label>
      <button type="submit">Apply Filters</button>
    </form>
  );
};

export default FilterForm;
