import React, { useEffect, useState } from 'react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    fetch('/api/users/')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      <h1>Manage Users</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} onClick={() => toggleRowExpansion(index)}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone_number}</td>
              <td>{user.gender}</td>
              {expandedRows.includes(index) && (
                <tr>
                  <td colSpan="4">
                    <strong>Primary Address:</strong> {user.primary_address || 'N/A'}<br />
                    <strong>Created At:</strong> {user.created_at}<br />
                    <strong>Updated At:</strong> {user.updated_at}
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

export default ManageUsers;
