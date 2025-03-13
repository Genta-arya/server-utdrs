
const STATIC_TOKEN = process.env.API_KEY; // Ambil dari .env

export const MidlewareEndpoint = (req, res, next) => {
  const token = req.headers["x-api-key"]; // Ambil token dari request header

  if (!token || token !== STATIC_TOKEN) {
    return res.status(403).json({ message: "Akses ditolak" });
  }

  next(); // Lanjutkan jika token valid
};
