// src/pages/admin/Inventory.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import Header from "../../components/Header"; 

const Inventory = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/api/admin/inventory/")
      .then((response) => {
        setLogs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching inventory logs:", error.response || error);
        setError("⚠️ Failed to load inventory logs. Check admin access.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">📦 Manage Inventory Logs</h2>
      {error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
          {/* Optionally, you can add a button to go back to login if needed */}
          <button
            onClick={() => navigate("/admin/login")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      ) : loading ? (
        <p>Loading inventory logs...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changed By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{log.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.product__name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.change_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.quantity_changed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(log.change_date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.changed_by__username || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;
