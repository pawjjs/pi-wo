import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next){

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({
            error: "Brak tokena uwierzytelniającego. Zaloguj się."
        });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if(err) {

            return res.status(401).json({ 
                error: "Nieprawidłowy lub wygasły token." 
            });

        }

        req.user = decodedUser;
        next();
    });
}