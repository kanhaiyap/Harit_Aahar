// src/pages/About.js

import React from 'react';


const About = () => {
  return (
    
      <section id="about-us">
        <div className="container">
          <div className="about-heading">
            <h1>About Us</h1>
            <p>Revolutionizing the Green Industry by Delivering the Freshest Food at Your Doorstep</p>
          </div>

          <div className="about-content">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                At Harit Aahar, we are revolutionizing the green industry by delivering the freshest food straight 
                to your doorstep. Our mission is to change the way the world eats. We want to make people happier 
                through our unique products, ensuring they enjoy healthy, nutritious meals that care for their 
                well-being. We believe that food should not only be delicious but also contribute positively to 
                your health.
              </p>

              <h2>Why Choose Us?</h2>
              <ul>
                <li><strong>Freshness Guaranteed:</strong> Our products are delivered straight from local farms to ensure maximum freshness.</li>
                <li><strong>Eco-Friendly:</strong> We focus on sustainability, using eco-friendly packaging and minimizing our carbon footprint.</li>
                <li><strong>Locally Sourced:</strong> We partner with local farmers and producers to support local economies and provide the freshest food.</li>
                <li><strong>Healthy Options:</strong> We offer a wide variety of healthy and nutritious food items tailored to your dietary needs.</li>
              </ul>
            </div>

            <div className="about-image">
              {/* You can add an image here if needed */}
              {/* <img src={require('../assets/images/about_us_image.jpg')} alt="Revolutionizing the Green Industry" /> */}
            </div>
          </div>

          <div className="about-footer">
            <p>Join us in our journey towards a healthier, greener, and more sustainable future. Together, we can make a positive impact on our planet.</p>
          </div>
        </div>
      </section>
    
  );
};

export default About;
