import express from "express";
import reportSummaryService from "./reportSummary.service";

const router = express.Router();

router.put("/:rpsId", async (req, res) => {
  try {
    const { rpsId } = req.params;
    const data = await reportSummaryService.createOrUpdateReportSummary(rpsId);
    res.status(200).json({
      status: true,
      message: "Success",
      data: data,
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

router.get("/:rpsId", async (req, res) => {
  const { rpsId } = req.params;
  try {
    const data = await reportSummaryService.getReportSummary(rpsId);
    return res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

export default router;
