// backend/index.js
import express from "express";
import { authMiddleware } from "./middleware/auth.js";
import pkg from "express-openid-connect";
import cors from "cors";

const { requiresAuth } = pkg;
const app = express();

app.use(authMiddleware);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  return res.oidc.login({ returnTo: "http://localhost:5173/profile" });
});

app.get("/profile", requiresAuth(), (req, res) => {
  try {
    res.json(req.oidc.user);
  } catch (error) {
    console.log(error);
  }
});

//Protected route
app.get("/secure-data", requiresAuth(), (req, res) => {
  try {
    res.json({
      message: "This is protected data",
      user: req.oidc.user });
  } catch (error) {
    console.error("Error viewing protected data:", error);
  }
  });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
