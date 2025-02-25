import React, { useEffect, useState } from 'react';

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    fetch('/api/addresses/')
      .then(response => response.json())
      .then(data => setAddresses(data))
      .catch(error => console.error('Error fetching addresses:', error));
  }, []);

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      <h1>Manage Addresses</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Address Line 1</th>
            <th>City</th>
            <th>State</th>
            <th>Postal Code</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((address, index) => (
            <tr key={index} onClick={() => toggleRowExpansion(index)}>
              <td>{address.user}</td>
              <td>{address.address_line1}</td>
              <td>{address.city}</td>
              <td>{address.state}</td>
              <td>{address.postal_code}</td>
              {expandedRows.includes(index) && (
                <tr>
                  <td colSpan="5">
                    <strong>Address Line 2:</strong> {address.address_line2 || 'N/A'}<br />
                    <strong>Country:</strong> {address.country}<br />
                    <strong>Phone:</strong> {address.phone_number}
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

export default ManageAddresses;
