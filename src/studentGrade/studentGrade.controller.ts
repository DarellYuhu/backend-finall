import express from "express";
import { auth, validateSchema } from "../middleware";
import multer from "multer";
import { xlsxFileSchema } from "../schemas";
import studentGradeService from "./studentGrade.service";
const upload = multer();

const router = express.Router();

router.put(
  "/:gradingSystemId",
  auth,
  upload.single("grade"),
  validateSchema(xlsxFileSchema),
  async (req, res) => {
    try {
      const { gradingSystemId } = req.params;
      const file = req.file;

      const data = await studentGradeService.createOrUpdateGrade(
        file,
        gradingSystemId
      );
      res.status(200).json({
        status: true,
        message: "Grade has been updated",
        data,
      });
    } catch (error) {
      if (error.code === "P2003") {
        return res.status(404).json({
          status: false,
          message: "Student nim on the list not found",
          error,
        });
      }
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error,
      });
    }
  }
);

export default router;
