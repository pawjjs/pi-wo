import express from "express";
import bcrypt from "bcryptjs";

const router = express.Router();

let users = [];
let nextUserId = 1;


router.post("/register", async (req, res) => {
    const {username, email, password } = req.body ?? {};

    if (!username || !email || !password || password.length < 6)
    {
        return res.status(400).json({
            error: "Wszystkie pola są wymagane, a hasło musi mieć min. 6 znaków."
        });
    }

    const userExists = users.some(u => u.username === username || u.email === email);

    if(userExists){
        return res.status(409).json({
            error: "Użytkownik o takim loginie lub adresie e-mail już istnieje." 
        });
    }
        

    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
        id: nextUserId++,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        role: "user",
        chips: 10000,
        created_at: new Date().toISOString()
    };

    users.push(newUser);

    res.status(201).json({
        message: "Rejestracja zakończona sukcesem!",
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            chips: newUser.chips
        }
        
    });



});

router.post("/login", async (req, res) => {
    res.json({ message: "cos2" });
});

export default router;

  