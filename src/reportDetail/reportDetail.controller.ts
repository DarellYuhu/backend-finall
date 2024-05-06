import express from "express";
import { auth } from "../middleware";
import reportDetailService from "./reportDetail.service";

const router = express.Router();

router.put("/:rpsId", auth, async (req, res) => {
  try {
    const { rpsId } = req.params;
    const data = await reportDetailService.createOrUpdateRps(rpsId);
    return res.status(200).json({
      status: true,
      message: "Report detail created",
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

router.get("/:rpsId", auth, async (req, res) => {
  try {
    const { rpsId } = req.params;
    const data = await reportDetailService.getReportDetail(rpsId);
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
