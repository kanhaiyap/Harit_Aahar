import React, { useState } from 'react';
import Layout from '../components/Layout';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate sending data to the server
    console.log('Form submitted:', formData);

    // Reset form after submission
    setFormData({ name: '', email: '', message: '' });

    alert('Thank you for contacting us!');
  };

  return (
    // <Layout title="Contact Us | Harit Aahar">
      <section id="contact-us">
        <div className="container">
          <div className="contact-heading">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out.</p>
          </div>

          <div className="contact-details">
            <h2>Our Contact Information</h2>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:c.pandey1987@gmail.com">c.pandey1987@gmail.com</a></li>
              <li><strong>Phone Number:</strong> <a href="tel:+919909334301">9909334301</a></li>
              <li><strong>Address:</strong> Raj Palace, Chhani, 391740 Vadodara, Gujarat</li>
            </ul>

            <h2>Other Ways to Reach Us</h2>
            <ul>
              <li><strong>Customer Support Hotline:</strong> Still Working</li>
              <li><strong>WhatsApp Support:</strong> <a href="https://wa.me/919909334301" target="_blank" rel="noopener noreferrer">Click here to chat</a></li>
              
            </ul>
          </div>

          <div className="contact-form">
            <h2>Contact Form</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Your Name:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />

              <label htmlFor="email">Your Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />

              <label htmlFor="message">Your Message:</label>
              <textarea 
                id="message" 
                name="message" 
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </section>
    // </Layout>
  );
};

export default Contact;
