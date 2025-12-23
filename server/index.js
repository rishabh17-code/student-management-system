require('dotenv').config(); // 1. Sabse upar hona chahiye
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(cors({
    origin: "https://student-management-system-2-0v8x.onrender.com", // Yahan apna copy kiya hua link dalein
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.get('/', (req, res) => {
    res.send("Backend is working perfectly!");
});

// 2. Database Connection (Ab sab kuch .env se aa raha hai)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 3. Secret Key ab .env se aayegi
const SECRET_KEY = process.env.JWT_SECRET;

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

// Is variable ko app.listen se pehle ya usi ke saath likh sakte hain
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Secure Server is running on port ${PORT}`);
});