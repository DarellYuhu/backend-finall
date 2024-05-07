import { Router } from "express";
import multer from "multer";
import employeeService from "./employee.service";

const router = Router();
const upload = multer();

router.post("/create-many", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const data = employeeService.createManyEmployee(file);
    res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .send({ status: "FAILED", data: { error: error?.message || error } });
    }
    if (error.name === "PrismaClientValidationError") {
      return res.status(400).send({
        status: "FAILED",
        data: { error: "Check xlsx data to follow the field rules" },
      });
    }
    res.status(500).send({ status: "FAILED", data: { error: error.message } });
  }
});

export default router;
