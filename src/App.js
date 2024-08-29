import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users');
        // Sort users by trial_end_date in ascending order
        const sortedUsers = response.data.sort((a, b) => new Date(a.trial_end_date) - new Date(b.trial_end_date));
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus; // Toggle status
      const response = await axios.put(`http://localhost:5000/users/${id}`, { status: newStatus });

      // Update the user status and trial_end_date in the state
      setUsers(users.map(user => 
        (user._id === id ? { ...user, status: newStatus, trial_end_date: response.data.trial_end_date } : user)
      ));
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  // Function to calculate the days remaining until the trial end date
  const daysRemaining = (date) => {
    const today = new Date();
    const endDate = new Date(date);
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to check if today is the trial end date
  const isTrialEndDateToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(date).toISOString().split('T')[0];
    return today === endDate;
  };

  // Function to format date to yyyy-mm-dd
  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="App">
      <h1>User List</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>User ID</th>
            <th>Status</th>
            <th>Trial End Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const remainingDays = daysRemaining(user.trial_end_date);
            const trialEndDateClass = isTrialEndDateToday(user.trial_end_date)
              ? 'trial-end-today'
              : remainingDays <= 3
              ? 'warning'
              : '';

            return (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.user_id}</td>
                <td>{user.status ? 'Active' : 'Inactive'}</td>
                <td className={trialEndDateClass}>
                  {formatDate(user.trial_end_date)}
                </td>
                <td>
                  <button onClick={() => toggleStatus(user._id, user.status)}>
                    {user.status ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
