import express from "express";
import { auth } from "../middleware";
import rpsService from "./rps.service";
import type { Request } from "express";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await rpsService.getRpsById(id);
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Rps not found",
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
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = rpsService.deleteRps(id);
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Rps not found",
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
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    const data = await rpsService.updateRps(id, payload);
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Rps not found",
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
});

interface IQuery {
  major: string;
  curriculumId: string;
}
router.get("/list/all", async (req: Request<{}, {}, {}, IQuery>, res) => {
  try {
    const { curriculumId, major } = req.query;
    const data = rpsService.getAllRps({ major, curriculumId });
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

export default router;
