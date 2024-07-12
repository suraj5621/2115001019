// src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterForm from './FilterForm';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/categories/Phone/products`, {
        params: {
          top: 10,
          minPrice: filters.minPrice || 1,
          maxPrice: filters.maxPrice || 10000,
          sortBy: filters.sortBy || '',
        },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const handleFilterSubmit = (filters) => {
    fetchProducts(filters);
  };

  return (
    <div>
      <h1>Product List</h1>
      <FilterForm onSubmit={handleFilterSubmit} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              {/* Add more product details as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductList;
