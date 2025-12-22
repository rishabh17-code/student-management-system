import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // --- 1. STATE VARIABLES ---
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // Login ke liye ab Email use hoga
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');

  // Student Data ke liye
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [marks, setMarks] = useState('');

  // --- 2. FETCH DATA FUNCTION ---
  const fetchStudents = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:8081/students', {
        headers: { 'Authorization': token }
      });
      if(res.data.message === "Access Denied! No Token." || res.data.message === "Invalid Token") {
        handleLogout();
      } else {
        setStudents(res.data);
      }
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if(token) fetchStudents();
  }, [token]);

  // --- 3. LOGIN FUNCTION (UPDATED FOR EMAIL) ---
  const handleLogin = async () => {
    try {
      // Note: Yahan hum ab 'email' bhej rahe hain
      const res = await axios.post('http://localhost:8081/login', { email, password });
      
      if (res.data.status === "success") {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        alert("Login Successful!");
      } else {
        alert(res.data.message); // Server se jo error aayega wo dikhega
      }
    } catch (err) { console.log(err); }
  };

  // --- 4. LOGOUT FUNCTION ---
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setStudents([]);
  };

  // --- 5. ADD STUDENT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/add-student', 
        { name, roll_no: rollNo, marks },
        { headers: { 'Authorization': token } }
      );
      setName(''); setRollNo(''); setMarks('');
      fetchStudents(); 
    } catch (err) { console.log(err); }
  };

  // --- 6. DELETE FUNCTION ---
  const handleDelete = async (id) => {
    try {
      await axios.delete('http://localhost:8081/student/' + id, {
        headers: { 'Authorization': token }
      });
      fetchStudents();
    } catch (err) { console.log(err); }
  };

  // --- 7. SHOW TOPPERS FUNCTION ---
  const showToppers = async () => {
    try {
      const res = await axios.get('http://localhost:8081/students/toppers', {
        headers: { 'Authorization': token }
      });
      setStudents(res.data);
    } catch (err) { console.log(err); }
  };

  // --- VIEW 1: LOGIN PAGE (UPDATED UI) ---
  if (!token) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Student Login</h1>
        {/* Username ki jagah ab Email Input hai */}
        <input 
          type="email" 
          placeholder="Enter Email" 
          onChange={e => setEmail(e.target.value)} 
          style={{ padding: "10px", margin: "10px" }}
        /><br/>
        
        <input 
          type="password" 
          placeholder="Enter Password" 
          onChange={e => setPassword(e.target.value)} 
          style={{ padding: "10px", margin: "10px" }}
        /><br/>
        
        <button onClick={handleLogin} style={{ padding: "10px 20px" }}>Login</button>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD (SAME AS BEFORE) ---
  return (
    <div style={{ padding: "50px" }}>
      <button onClick={handleLogout} style={{ float: "right", backgroundColor: "red", color: "white" }}>Logout</button>
      <h1>Student Management System</h1>

      <div style={{ marginBottom: "20px" }}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="Roll No" value={rollNo} onChange={e => setRollNo(e.target.value)} />
        <input type="number" placeholder="Marks" value={marks} onChange={e => setMarks(e.target.value)} />
        <button onClick={handleSubmit}>Add Student</button>
      </div>

      <button onClick={showToppers} style={{ backgroundColor: "yellow", marginRight:"10px" }}>Show Toppers (&gt;80)</button>
      <button onClick={fetchStudents}>Show All</button>

      <table border="1" cellPadding="10" style={{ width: "100%", marginTop:"20px" }}>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Roll No</th><th>Marks</th><th>Action</th></tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.roll_no}</td>
              <td>{student.marks}</td>
              <td>
                <button onClick={() => handleDelete(student.id)} style={{ backgroundColor: "red", color: "white" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;