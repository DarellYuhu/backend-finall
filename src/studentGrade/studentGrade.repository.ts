import { GradingSystem, StudentGrade } from "@prisma/client";
import prisma from "../database";

const getGradingSystem = async (id: string) => {
  return await prisma.gradingSystem.findUnique({
    where: {
      id,
    },
  });
};

const createOrUpdateGrade = async (
  data: Pick<StudentGrade, "rawGrade" | "studentNim">[],
  targetGrade: GradingSystem,
  gradingSystemId: string
) => {
  return await prisma.$transaction(async (prisma) => {
    return await Promise.all(
      data.map(async (item) => {
        const score = item.rawGrade * (targetGrade.gradingWeight / 100);
        return await prisma.studentGrade.upsert({
          where: {
            studentGradeId: {
              studentNim: item.studentNim,
              gradingSystemId,
            },
          },
          create: {
            rawGrade: item.rawGrade,
            studentNim: item.studentNim,
            score,
            gradingSystemId,
          },
          update: {
            rawGrade: item.rawGrade,
            score,
          },
        });
      })
    );
  });
};

export default { getGradingSystem, createOrUpdateGrade };
