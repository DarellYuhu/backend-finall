import express from "express";
import { auth, validateSchema } from "../middleware";
import multer from "multer";
import { createCurriculumSchema, xlsxFileSchema } from "../schemas";
import curriculumService from "./curriculum.service";
import { ValidationError } from "yup";

const upload = multer();
const router = express.Router();

router.post(
  "/",
  upload.single("curriculumFile"),
  validateSchema(createCurriculumSchema),
  async (req, res) => {
    try {
      const { major, year, headOfProgramStudyId } = req.body;
      const file = req.file;

      const curriculum = await curriculumService.createCurriculum(
        file,
        major,
        year,
        headOfProgramStudyId
      );
      res.status(201).json({
        status: true,
        message: "Curriculum created successfully",
        data: curriculum,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: false,
          message: "Please provide valid xlsx data",
          error: error.inner.map((err: ValidationError) => err.message),
        });
      }

      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "Curriculum already exist",
          error,
        });
      }

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  }
);

router.post(
  "/:id/cpl",
  upload.single("curriculumCpl"),
  validateSchema(xlsxFileSchema),
  async (req, res) => {
    try {
      const id = req.params.id;
      const file = req.file;

      const cpl = await curriculumService.createCurriculumCpl(file, id);
      res.status(201).json({
        status: true,
        message: "Curriculum Cpl created successfully",
        data: cpl,
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "Curriculum's CPLs already exist",
          error,
        });
      }

      if (error.code === "P2003") {
        return res.status(404).json({
          status: false,
          message: "Curriculum not found",
          error,
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: false,
          message: "Please provide valid data",
          error: error.name,
        });
      }

      console.log(error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const major = req.query.major as string;
    const data = await curriculumService.getAllCurriculum(major);
    res.json({
      status: true,
      message: "Data retrieved successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await curriculumService.getCurriculumById(id);
    res.json({
      status: true,
      message: "Data retrieved successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const curriculum = await curriculumService.deleteCurriculum(id);
    res.json({
      status: true,
      message: "Curriculum deleted successfully",
      data: curriculum,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Data not found",
        error,
      });
    }

    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

export default router;
