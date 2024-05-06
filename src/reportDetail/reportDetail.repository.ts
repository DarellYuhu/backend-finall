import { ReportDetail } from "@prisma/client";
import prisma from "../database";

const createOrUpdateReportDetail = async (
  rpsId: string,
  data: Omit<ReportDetail, "createAt">
) => {
  return await prisma.reportDetail.upsert({
    where: {
      rpsId,
    },
    update: data,
    create: data,
  });
};

const getReportDetail = async (rpsId: string) => {
  return await prisma.reportDetail.findUnique({
    where: {
      rpsId,
    },
    include: {
      Rps: {
        select: {
          CpmkGrading: {
            include: {
              GradingSystem: true,
            },
          },
        },
      },
    },
  });
};

export default { createOrUpdateReportDetail, getReportDetail };
