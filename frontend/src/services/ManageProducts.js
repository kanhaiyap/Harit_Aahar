import React, { useState, useEffect } from 'react';
import { getCSRFToken } from '../utils/csrf'; 

const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  // Fetch products from the backend when the component mounts
  useEffect(() => {
    fetch('/api/products/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched Products:", data);  // Check what is returned from the backend
        setProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);
  


  // Add a new empty product row
  const addProductRow = () => {
    setProducts([...products, {
      name: '',
      description: '',
      price: 0,
      category: 1,
      brand: '',
      color: '',
      size: '',
      stock_quantity: 0,
      availability: false,
      rating: 0,
      reviews: 0,
      expiry_date: '',
      shipping_cost: 0,
      seller_name: '',
      seller_rating: 0,
    }]);
  };

  // Delete a product from the list
  const deleteProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  // Update product details as user types
  const handleChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  // Save changes to the backend
  const saveChanges = () => {
    // Remove the image field before sending data to the backend
    const productsToSend = products.map(product => {
      const { image, ...rest } = product;
      return rest;
    });
  
    fetch('http://127.0.0.1:8000/api/products/update/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify(productsToSend),  // Send data without the image field
    })
    .then(async response => {
      const text = await response.text();
      console.log('Raw server response:', text);
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return JSON.parse(text);
    })
    .then(data => {
      if (data.success) {
        alert('Products updated successfully!');
      } else {
        alert(`Failed to save products: ${data.message}`);
      }
    })
    .catch(error => {
      console.error('Error saving products:', error);
      alert('An error occurred while saving products.');
    });
  };
  

  return (
    <div>
        <h1>Manage Products</h1>
      <form>
        <table border="1" id="productsTable">
          <thead>
            <tr>
              <th>Name</th><th>Description</th><th>Price</th><th>Category</th>
              <th>Brand</th><th>Color</th><th>Size</th><th>Quantity</th>
              <th>Availability</th><th>Rating</th><th>Reviews</th><th>Expiry Date</th>
              <th>Shipping Cost</th><th>Seller Name</th><th>Seller Rating</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td><input type="text" value={product.name} onChange={(e) => handleChange(index, 'name', e.target.value)} /></td>
                <td><input type="text" value={product.description} onChange={(e) => handleChange(index, 'description', e.target.value)} /></td>
                <td><input type="number" step="0.01" value={product.price} onChange={(e) => handleChange(index, 'price', e.target.value)} /></td>
                <td><input type="text" value={product.category} onChange={(e) => handleChange(index, 'category', e.target.value)} /></td>
                <td><input type="text" value={product.brand} onChange={(e) => handleChange(index, 'brand', e.target.value)} /></td>
                <td><input type="text" value={product.color} onChange={(e) => handleChange(index, 'color', e.target.value)} /></td>
                <td><input type="text" value={product.size} onChange={(e) => handleChange(index, 'size', e.target.value)} /></td>
                <td><input type="number" value={product.stock_quantity} onChange={(e) => handleChange(index, 'stock_quantity', e.target.value)} /></td>
                <td><input type="checkbox" checked={product.availability} onChange={(e) => handleChange(index, 'availability', e.target.checked)} /></td>
                <td><input type="number" step="0.1" value={product.rating} onChange={(e) => handleChange(index, 'rating', e.target.value)} /></td>
                <td><input type="number" value={product.reviews} onChange={(e) => handleChange(index, 'reviews', e.target.value)} /></td>
                <td><input type="date" value={product.expiry_date} onChange={(e) => handleChange(index, 'expiry_date', e.target.value)} /></td>
                <td><input type="number" step="0.01" value={product.shipping_cost} onChange={(e) => handleChange(index, 'shipping_cost', e.target.value)} /></td>
                <td><input type="text" value={product.seller_name} onChange={(e) => handleChange(index, 'seller_name', e.target.value)} /></td>
                <td><input type="number" step="0.1" value={product.seller_rating} onChange={(e) => handleChange(index, 'seller_rating', e.target.value)} /></td>
                <td>
                    <input 
                        type="text" 
                        value={product.image} 
                        onChange={(e) => handleChange(index, 'image', e.target.value)} 
                        placeholder="Enter image URL or path" 
                    />
                    </td>

                <td>
                  <button type="button" onClick={() => deleteProduct(index)}>Delete</button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addProductRow}>Add New Product</button>
        <button type="button" onClick={saveChanges}>Save Changes</button>
      </form>
      </div>
  );
};

export default ManageProducts;
