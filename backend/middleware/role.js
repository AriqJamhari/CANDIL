const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Akses ditolak: User tidak terautentikasi' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak: Hak akses tidak memadai' });
    }
    
    next();
  };
};

module.exports = roleGuard;
