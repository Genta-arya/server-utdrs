
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Routes } from "./src/Routes/Routes.js";
import { MidlewareEndpoint } from "./src/Midleware/index.js";


const app = express();
const PORT = 8085;
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

app.use(express.json());
app.use(
  cors({

    origin: ["https://utdrs.apiservices.my.id" , "http://localhost:5173"],
    credentials: true,
  })
);
app.use(domainMiddleware); 
app.use("/api/v1", MidlewareEndpoint, Routes )





httpServer.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
  