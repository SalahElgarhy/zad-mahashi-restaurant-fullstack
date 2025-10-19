export default function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'] || req.body.password; // يمكن إرسالها في Header أو Body
  if (password !== 'Mo2020#') {
    return res.status(401).json({ message: 'Invalid admin password' });
  }
  next();
}