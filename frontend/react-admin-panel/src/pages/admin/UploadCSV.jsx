import { useState, useEffect } from "react";

const UploadCSV = () => {
    const [file, setFile] = useState(null);
    const [csrfToken, setCsrfToken] = useState("");
    const [message, setMessage] = useState("");

    // Function to get CSRF token from cookies
    const getCsrfFromCookies = () => {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            if (cookie.startsWith("csrftoken=")) {
                return cookie.split("=")[1];
            }
        }
        return "";
    };

    // Fetch CSRF token when component loads
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/get-csrf-token/", {
            credentials: "include",  // ✅ Ensure cookies are included in request
        })
            .then(response => response.json())
            .then(data => {
                setCsrfToken(getCsrfFromCookies());
                console.log("✅ CSRF Token Retrieved:", getCsrfFromCookies());
            })
            .catch(error => console.error("❌ Failed to fetch CSRF Token:", error));
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a CSV file first.");
            return;
        }

        console.log("📌 Using CSRF Token:", csrfToken);  // ✅ Debug log

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/upload-csv/", {
                method: "POST",
                body: formData,
                credentials: "include",  // ✅ Ensure cookies are sent with request
                headers: {
                    "X-CSRFToken": csrfToken,  // ✅ Include CSRF token
                },
            });

            const text = await response.text();
            console.log("📌 Raw Response:", text);

            const data = JSON.parse(text);
            if (response.ok) {
                setMessage(`✅ ${data.message}`);
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error("❌ Upload failed:", error);
            setMessage("❌ Upload failed. Please try again.");
        }
    };

    return (
        <div>
            <h2>📂 Upload CSV File</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UploadCSV;
