const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ detail: 'No token, authorization denied' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey123');
    req.user = decoded; // { sub: user._id }
    next();
  } catch (err) {
    res.status(401).json({ detail: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
