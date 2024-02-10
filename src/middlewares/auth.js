const jwt = require('jsonwebtoken');

const Auth = async (req, res, next) => {
    try {
        // get token from header
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({
                message: 'No token, authorization denied'
            });
        }
        // verify token
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!verify) {
            return res.status(401).json({
                message: 'Token verification failed, authorization denied'
            });
        }

        // add user from payload
        req.user = verify;
        req.token = token;
        next();
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
}

module.exports = Auth;