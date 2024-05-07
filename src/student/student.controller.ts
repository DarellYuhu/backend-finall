import { Router } from "express";
import multer from "multer";
import studentService from "./student.service";

const router = Router();
const upload = multer();

router.post("/create-many", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const data = studentService.createManyStudent(file);
    res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .send({ status: "FAILED", data: { error: error?.message || error } });
    }
    console.log(error);
    if (error.name === "PrismaClientValidationError") {
      return res.status(400).send({
        status: "FAILED",
        data: { error: "Check xlsx data to follow the field rules" },
      });
    }
    res
      .status(error?.status || 500)
      .send({ status: "FAILED", data: { error: error?.message || error } });
  }
});

export default router;
