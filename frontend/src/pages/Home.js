import React, { useEffect, useState } from "react";
import { getCsrfFromCookies } from "../auth/CSRFToken";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook


// ✅ Initialize navigation

  // ✅ Handle Category Click



// Function to import all images dynamically
const importAll = (requireContext) => {
  const images = {};
  requireContext.keys().forEach((key) => {
    const imageName = key.replace("./", "").toLowerCase(); // ✅ Normalize image name (lowercase)
    images[imageName] = requireContext(key);
  });
  return images;
};

// Import images for slides and categories
const slideImages = importAll(require.context("../assets/images/slides", false, /\.(png|jpe?g|jpeg|svg)$/));
const categoryImages = importAll(require.context("../assets/images/categories", false, /\.(png|jpe?g|jpeg|svg)$/));

const getCategoryImage = (categoryName) => {
  if (!categoryName) return categoryImages["default-category.jpeg"]; // ✅ Default image if name is missing

  const formattedName = `${categoryName.toLowerCase().replace(/\s+/g, "")}.jpeg`; // ✅ Remove spaces & format

  return categoryImages[formattedName] || categoryImages["default-category.jpeg"]; // ✅ Use default if not found
};
const Home = () => {
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); 

  const handleCategoryClick = (category) => {
    console.log("🔹 Clicked Category Object:", category); // ✅ Debug log
  
    if (!category || !category.name) {
      console.error("❌ Error: Category is missing or has no name!", category);
      return;
    }
  
    // ✅ Convert category name to URL-friendly format
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
    console.log("🔹 Navigating to:", `/products?category=${categorySlug}`); // ✅ Debug log
  
    navigate(`/products?category=${categorySlug}`);
    
  };


    // Fetch categories from backend
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const csrfToken = getCsrfFromCookies(); // ✅ Fetch the CSRF token
          console.log("🔹 CSRF Token in Fetch:", csrfToken);
    
          const response = await fetch("/api/categories/", {
            method: "GET",
            headers: {
              "X-CSRFToken": csrfToken,  // ✅ Send CSRF token
              "Content-Type": "application/json"
            },
            credentials: "include", // ✅ Ensure cookies are sent
          });
    
          console.log("🔹 Fetch Response:", response); // ✅ Debug response
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch categories: ${response.status} - ${errorText}`);
          }
    
          const data = await response.json();
          console.log("✅ Categories Fetched:", data);
          setCategories(data);
        } catch (error) {
          console.error("❌ Error fetching categories:", error);
        }
      };
    
      fetchCategories();
    }, []);
    
    // Fetch products only when category is selected
    useEffect(() => {
      try {
        const importAll = (requireContext) => requireContext.keys().map(requireContext);
        const slidesData = importAll(require.context("../assets/images/slides", false, /\.(png|jpe?g|jpeg|svg)$/));
        console.log("✅ Slides Loaded:", slidesData);
        setSlides(slidesData);
      } catch (error) {
        console.error("❌ Error loading slides:", error);
      }
    }, []);

    return (
      <div className="content-wrapper">
        {/* ✅ Hero Section */}
        <section id="hero">
          <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
            <div className="carousel-inner">
              {slides.length > 0 ? (
                slides.map((image, index) => (
                  <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
                    <img
                      src={image.default || image}
                      className="d-block w-100"
                      alt={`Slide ${index + 1}`}
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                    <div className="carousel-caption d-none d-md-block">
                      <h1>Revolutionizing the Green Industry</h1>
                      <p>We deliver the freshest, eco-friendly food at your doorstep.</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading slides...</p>
              )}
            </div>
  
            {/* ✅ Carousel Controls */}
            <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </section>
        {/* ✅ Category Section */}
      <section id="categories" className="container mt-4">
        <h2 className="text-center">Shop by Category</h2>
        <div className="row">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div className="col-md-4 mb-3" key={category.id}>
                <div className="card shadow" onClick={() => handleCategoryClick(category)} style={{ cursor: "pointer" }}>
                  <img
                    src={getCategoryImage(category.name)} // ✅ Ensure the image matches
                    className="card-img-top"
                    alt={category.name}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{category.name}</h5>
                    <p className="card-text">{category.description || "No description available."}</p>
                    <button onClick={() => handleCategoryClick(category)} className="btn btn-primary">
  View Products
</button>

                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Loading categories...</p>
          )}
        </div>
      </section>
      </div>
    );
  };
  
export default Home;
