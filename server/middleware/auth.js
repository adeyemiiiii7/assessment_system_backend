const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import the User model

const auth = async (req, res, next) => {
    console.log("Middle ware has been called")
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log("Token : ", token);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, 'secretkey');
        console.log("Decoded Token : ", decodedToken);
        if (decodedToken) {
            console.log("ID gotten : ", decodedToken.id);
            // Fetch the user object using the decoded user ID
            const user = await User.findById(decodedToken.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Assign the user object to req.user
            req.user = user;
            next();
        } else {
            res.status(401).json({ message: 'Invalid authorization token' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = auth;

