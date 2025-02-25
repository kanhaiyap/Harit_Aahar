import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";

export default function ManageProducts() {
  const [csvFile, setCsvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!csvFile) {
      setUploadStatus("Please select a CSV file first.");
      return;
    }
    
    // Parse the CSV file using PapaParse
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Send the parsed data to your backend
          const response = await axios.post(
            "http://127.0.0.1:8000/api/admin/upload-products/",
            { data: results.data }, // sending JSON payload with a "data" key
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setUploadStatus(response.data.message);
        } catch (error) {
          setUploadStatus("❌ Error uploading data.");
          console.error("Upload Error:", error);
        }
      },
      error: (err) => {
        setUploadStatus("❌ Error parsing CSV file.");
        console.error("CSV Parse Error:", err);
      },
    });
  };

  return (
    <div className="p-5">
      <h2 className="text-lg font-bold mb-3">Upload Products (CSV Data)</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload
      </button>
      {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
    </div>
  );
}
