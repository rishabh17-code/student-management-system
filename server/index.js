const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // <--- PUT YOUR PASSWORD HERE
    database: 'student_db'
});

const SECRET_KEY = "my_secret_key"; // The key to stamp the ID cards

// 2. The Login Route (The Only Public Door)
 // REPLACED LOGIN ROUTE (Database Check)
 app.post('/login', (req, res) => {
    const { email, password } = req.body; 

    const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, data) => {
        if(err) return res.json({ status: "error", message: "Server Error" });
        
        if(data.length > 0) {
            const id = data[0].id;
            
            // --- CHANGE: "jwt-secret-key" hata kar SECRET_KEY likhein ---
            const token = jwt.sign({ id }, SECRET_KEY, { expiresIn: '1d' });
            // -------------------------------------------------------------

            return res.json({ status: "success", token: token });
        } else {
            return res.json({ status: "error", message: "Wrong Email or Password" });
        }
    });
});
// 3. The Security Guard (Middleware)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; 
    if (!token) return res.json({ message: "Access Denied! No Token." });

    try {
        jwt.verify(token, SECRET_KEY); // Check if the token is valid
        next(); // Let them pass
    } catch (err) {
        return res.json({ message: "Invalid Token" });
    }
};

// --- PROTECTED ROUTES (Notice the 'verifyToken' inside them) ---

// Read Students
app.get('/students', verifyToken, (req, res) => {
    const sql = "SELECT * FROM students";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// Filter Toppers
app.get('/students/toppers', verifyToken, (req, res) => {
    const sql = "SELECT * FROM students WHERE marks > 80";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// Add Student
app.post('/add-student', verifyToken, (req, res) => {
    const { name, roll_no, marks } = req.body;
    const sql = "INSERT INTO students (name, roll_no, marks) VALUES (?, ?, ?)";
    db.query(sql, [name, roll_no, marks], (err, result) => {
        if (err) return res.json(err);
        return res.json("Student added successfully!");
    });
});

// Delete Student
app.delete('/student/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM students WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.json(err);
        return res.json("Student deleted.");
    });
});

app.listen(8081, () => {
    console.log("Secure Server is running on port 8081");
});