import jwt from 'jsonwebtoken';

export default function auth(role = null) {
  return (req, res, next) => {
    console.log("Middleware triggered"); // ✅ للتجربة
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (role && decoded.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
