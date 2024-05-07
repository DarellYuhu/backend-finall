import { Router } from "express";
import { auth, validateSchema } from "../middleware";
import subjectService from "./subject.service";
import { mappingCplSchema } from "../schemas";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const data = await subjectService.getAllSubject();
    return res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

router.get("/:id/cpl", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = subjectService.getSubjectById(id);
    return res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

router.get("/:id/prerequisite", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subjectService.getPrerequisiteSubject(id);
    return res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

router.put(
  "/:id/cpl-mapping",
  auth,
  validateSchema(mappingCplSchema),
  async (req, res) => {
    try {
      const { cplIds } = req.body;
      const { id } = req.params;
      const data = await subjectService.mapSubjectCpl(cplIds, id);
      res.status(201).json({
        status: true,
        message: "CPLs mapped to subject",
        data,
      });
    } catch (error) {
      if (error.code === "P2003") {
        return res.status(404).json({
          status: false,
          message: "Subject or CPL not found",
          error,
        });
      }

      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "CPL already mapped to subject",
          error,
        });
      }

      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  }
);

router.get("/:id/cpl-mapping", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subjectService.getSubjectCpl(id);
    return res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

export default router;
