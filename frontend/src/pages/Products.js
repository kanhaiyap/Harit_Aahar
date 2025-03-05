import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/styles/style.css';
const API_BASE_URL = process.env.REACT_APP_API_URL; 

console.log(API_BASE_URL)
const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();  // To access the search query from the URL

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        handleSearch(data);  // Apply the search filter when products are fetched
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  useEffect(() => {
    handleSearch(products);  // Re-run the filter when the search query changes
  }, [location.search]);
  useEffect(() => {
    fetch("/api/categories/") // ✅ Fetch categories (each contains products)
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ API Response:", data);
        applyFilters(data);
      })
      .catch((error) => console.error("❌ Error fetching products:", error));
  }, [location.search]);
  const applyFilters = (categories) => {
    const queryParams = new URLSearchParams(location.search);
    const selectedCategory = queryParams.get("category")?.toLowerCase() || "";
    const searchQuery = queryParams.get("search")?.toLowerCase() || "";
  
    let filtered = categories.flatMap((cat) => cat.products); // ✅ Start with all products
  
    // ✅ If a category is selected, filter by category name
    if (selectedCategory) {
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === selectedCategory
      );
  
      if (matchedCategory) {
        console.log("✅ Matched Category:", matchedCategory.name);
        filtered = matchedCategory.products;
      } else {
        console.warn("❌ No matching category found!");
        filtered = []; // If category not found, show no products
      }
    }
  
    // ✅ Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.brand.toLowerCase().includes(searchQuery)
      );
    }
  
    setFilteredProducts(filtered);
  };
  

  const handleSearch = (allProducts) => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search')?.toLowerCase() || '';

    if (searchQuery) {
      // Filter products based on search query
      const matchingProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.brand.toLowerCase().includes(searchQuery)
      );

      // Combine matching products first, followed by non-matching ones
      const nonMatchingProducts = allProducts.filter(product =>
        !matchingProducts.includes(product)
      );

      setFilteredProducts([...matchingProducts, ...nonMatchingProducts]);
    } else {
      // If no search query, display all products
      setFilteredProducts(allProducts);
    }
  };

  return (
    <div>
      <h1>Our Products</h1>

      {/* Display a message if no matching products are found */}
      {filteredProducts.length > 0 && (
        <>
          <ul className="products-container">
            {filteredProducts.map((product, index) => (
              <li key={product.id} className={`product-box ${index === 0 ? 'highlight' : ''}`}>
                <img
  src={`/images/products/${decodeURIComponent(product.image.split('/').pop()).replace(/\s+/g, ' ').trim()}`}
  alt={product.name.trim()}
  className="product-image"
/>

                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <p><strong>Price:</strong> ₹{product.price}</p>
                <button onClick={() => window.addToCart(product.id, product.name, product.price, product.image)}>
                  Add to Cart
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Fallback when no matches are found */}
      {filteredProducts.length === 0 && (
        <p>No matching products found. Showing all available products below:</p>
      )}

      {/* Display selected category */}
      {location.search.includes("category") && (
        <h3 className="text-center">
          Showing results for category:{" "}
          <strong>{new URLSearchParams(location.search).get("category")}</strong>
        </h3>
      )}

      
    </div>
  );
};

export default Products;
