// src/components/ProductDetails.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductDetails = ({ product }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [product]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/categories/${product.category}/products/${product.id}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  if (!details) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{details.name}</h2>
      <p>Price: ${details.price}</p>
      <p>Description: {details.description}</p>
      {/* Add more product details as needed */}
    </div>
  );
};

export default ProductDetails;
