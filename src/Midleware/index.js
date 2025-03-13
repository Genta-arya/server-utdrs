
const STATIC_TOKEN = process.env.API_KEY; 

export const MidlewareEndpoint = (req, res, next) => {
  const token = req.headers["x-api-key"]; 

  if (!token || token !== STATIC_TOKEN) {
    return res.status(403).json({ message: "Akses ditolak" });
  }

  next(); 
};
