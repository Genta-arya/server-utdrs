import express from "express";
import {
  HandleFormRegister,
  ValidateKtp,
} from "../Controller/FormController.js";

export const Routes = express.Router();

Routes.post("/form/registration", HandleFormRegister);
Routes.post("/check-ktp", ValidateKtp);
