import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers["authorization"].split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json({ error: "Access denied. No token provided." });
        }

        console.log("token ::::", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token." });
    }
};


export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }   
}

