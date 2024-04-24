const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) 
        return res.status(401).json({ message: 'Unauthorized' });
      
        const verified =  jwt.verify(token, 'secretkey', );
        if(!verified) 
        return res.status.json({ message: 'Forbidden' });
            req.user = verified.id;
            next();
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};       

module.exports = auth;
