import { useState, useEffect } from "react";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoriesWithProducts = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/admin/categories/");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("❌ Failed to fetch categories:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesWithProducts();
    }, []);

    if (loading) return <p>Loading categories...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

    return (
        <div>
            <h1>📂 Categories & Products</h1>
            {categories.length === 0 ? (
                <p>No categories found.</p>
            ) : (
                categories.map((category) => (
                    <div key={category.id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "20px" }}>
                        <h2>📁 {category.name}</h2>
                        <p>{category.description}</p>

                        {category.products.length === 0 ? (
                            <p style={{ color: "gray" }}>No products in this category.</p>
                        ) : (
                            <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
                                <thead>
                                    <tr>
                                        <th>🆔 ID</th>
                                        <th>📦 Product</th>
                                        <th>💰 Price</th>
                                        <th>📦 Stock</th>
                                        <th>🌟 Rating</th>
                                        <th>🛒 Seller</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category.products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.name}</td>
                                            <td>${product.price}</td>
                                            <td>{product.stock_quantity}</td>
                                            <td>⭐ {product.rating} ({product.reviews} reviews)</td>
                                            <td>{product.seller_name} (Rating: {product.seller_rating})</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Categories;
