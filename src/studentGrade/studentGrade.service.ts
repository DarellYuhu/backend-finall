import { StudentGrade } from "@prisma/client";
import { extractXlsx } from "../utils";
import studentGradeRepository from "./studentGrade.repository";
import { response as res } from "express";

const createOrUpdateGrade = async (
  file: Express.Multer.File,
  gradingSystemId: string
) => {
  const data = extractXlsx(file);
  const parsedData: Pick<StudentGrade, "rawGrade" | "studentNim">[] = data.map(
    (item: any) => ({
      rawGrade: item.grade,
      studentNim: item.nim.toString(),
    })
  );

  const targetGrade = await studentGradeRepository.getGradingSystem(
    gradingSystemId
  );

  if (!targetGrade) {
    return res.status(404).json({
      status: false,
      message: "Grading System not found",
    });
  }

  return await studentGradeRepository.createOrUpdateGrade(
    parsedData,
    targetGrade,
    gradingSystemId
  );
};

export default { createOrUpdateGrade };
