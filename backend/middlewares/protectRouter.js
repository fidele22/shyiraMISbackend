const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }

      req.user = user; // Attach the user info (from token) to the request object
      next();
    });
  } else {
    res.sendStatus(401); // No token provided
  }
};

module.exports = authenticateJWT;
