import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import { Routes } from "./src/Routes/Routes.js";
import { MidlewareEndpoint } from "./src/Midleware/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8085;
const httpServer = createServer(app);

const allowedDomains = [
  "https://utdrs.apiservices.my.id",
  "http://localhost:5173",
];

const domainMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedDomains.includes(origin)) {
    next();
  } else {
    res.status(403).json({ message: "Akses ditolak" });
  }
};


app.use(helmet()); 
app.use(hpp()); 
app.use(xss()); 
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500,
  standardHeaders: true, 
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Terlalu banyak permintaan, coba lagi nanti.",
    });
  },
});


app.use(limiter);
app.use(express.json());
app.use(
  cors({
    origin: allowedDomains,
    credentials: true,
  })
);
app.use(domainMiddleware);
app.use("/api/v1", MidlewareEndpoint, Routes);

httpServer.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
