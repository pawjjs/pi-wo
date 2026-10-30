import bcrypt from "bcryptjs";

let users = [];
let nextUserId = 1;


// router.post("/register", async (req, res) => {

export async function register(req, res) {

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



};

export async function login(req, res) {

    const {email, password} = req.body ?? {};

    if(!email || !password){
        return res.status(400).json({
            error: "Podaj login/email oraz hasło."
        });
    }

    const identifier = email.trim().toLowerCase();

    const user = users.find(u => u.email === identifier);

    if(!user) {
        return res.status(401).json({
            error: "Nieprawidłowy email lub haslo."
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) { 
        return res.status(401).json({
            error: "Nieprawidłowy email lub haslo."
        });
    }

    return res.status(200).json({
        message: "Logowanie powiodło się",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            chips: user.chips,
            role: user.role
        }
    });

}


  