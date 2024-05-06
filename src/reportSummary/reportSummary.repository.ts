import { ReportSummary } from "@prisma/client";
import prisma from "../database";

const getAssessmentIndicator = () => {
  return prisma.assessmentIndicator.findMany();
};

const createOrUpdateReportSummary = async (
  rpsId: string,
  data: Omit<ReportSummary, "createAt">
) => {
  return await prisma.reportSummary.upsert({
    where: {
      rpsId,
    },
    update: data,
    create: data,
  });
};

const getReportSummary = async (rpsId: string) => {
  return await prisma.reportSummary.findUnique({
    where: {
      rpsId,
    },
  });
};

export default {
  getAssessmentIndicator,
  createOrUpdateReportSummary,
  getReportSummary,
};
