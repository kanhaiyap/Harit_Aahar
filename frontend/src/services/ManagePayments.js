import React, { useEffect, useState } from 'react';

const ManageInventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    fetch('/api/inventory-logs/')
      .then(response => response.json())
      .then(data => setLogs(data))
      .catch(error => console.error('Error fetching inventory logs:', error));
  }, []);

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      <h1>Manage Inventory Logs</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Change Type</th>
            <th>Quantity Changed</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} onClick={() => toggleRowExpansion(index)}>
              <td>{log.product}</td>
              <td>{log.change_type}</td>
              <td>{log.quantity_changed}</td>
              <td>{log.change_date}</td>
              {expandedRows.includes(index) && (
                <tr>
                  <td colSpan="4">
                    <strong>Notes:</strong> {log.notes || 'N/A'}<br />
                    <strong>Changed By:</strong> {log.changed_by || 'N/A'}
                  </td>
                </tr>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageInventoryLogs;
