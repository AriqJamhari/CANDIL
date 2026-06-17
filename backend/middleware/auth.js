const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  let token = req.cookies && req.cookies.token;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak: Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains { id, nama, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Akses ditolak: Token tidak valid' });
  }
};

module.exports = verifyToken;
