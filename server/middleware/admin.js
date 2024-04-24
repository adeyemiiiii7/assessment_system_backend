const jwt = require("jsonwebtoken");
const User = require("../models/user");

const admin = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token)
            return res.status(401).json({ message: 'Unauthorized' });
        const verified = jwt.verify(token, 'secretkey');

        if (!verified)
            return res.status(401).json({ msg: "Token verification failed, authorization denied." });

        const user = await User.findById(verified.id);    
        if (user.type === "user" || user.type === "users") {
            return res.status(401).json({ msg: "You are not an admin!" });
        }
        
        // If the user is an admin, pass the verified token and user ID to the next middleware
        req.user = verified.id;
        req.token = token;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = admin;
