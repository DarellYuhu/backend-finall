import { Cpl, CurriculumFile } from "../../global";
import { extractXlsx, parsePrerequisites } from "../utils";
import curriculumRepository from "./curriculum.repository";
import curriculumSchema from "../schemas/curriculumSchema";
import { Major } from "@prisma/client";
import { cplSchema } from "../schemas";
import { response as res } from "express";

const createCurriculum = async (
  file: Express.Multer.File,
  major: Major,
  year: string,
  headOfProgramStudyId: string
) => {
  const data = extractXlsx(file);
  const parsedData: CurriculumFile[] = data.map((row: any) => ({
    code: row.code,
    indonesiaName: row.indonesiaName,
    englishName: row.englishName,
    credits: parseInt(row.credits),
    type: row.type,
    prerequisite: parsePrerequisites(row.prerequisite),
    semester: parseInt(row.semester),
  }));

  await curriculumSchema.validate(parsedData, { abortEarly: false });

  return curriculumRepository.createCurriculum({
    data: parsedData,
    major,
    year,
    headOfProgramStudyId,
  });
};

const createCurriculumCpl = async (
  file: Express.Multer.File,
  curriculumId: string
) => {
  const data = extractXlsx(file);
  const parsedData: Cpl[] = data.map((row: any) => ({
    code: row.code,
    description: row.description,
    curriculumId,
  }));

  await cplSchema.validate(parsedData, { abortEarly: false });
  return curriculumRepository.createCurriculumCpl(parsedData, curriculumId);
};

const getAllCurriculum = async (major: string) => {
  const data = await curriculumRepository.getAllCurriculum(major);
  if (!data || data.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Data not found",
    });
  }
  return data;
};

const getCurriculumById = async (id: string) => {
  const data = await curriculumRepository.getCurriculumById(id);
  if (!data) {
    return res.status(404).json({
      status: false,
      message: "Data not found",
    });
  }
  return data;
};

const deleteCurriculum = async (id: string) => {
  return await curriculumRepository.deleteCurriculumTransaction(id);
};

export default {
  createCurriculum,
  createCurriculumCpl,
  getAllCurriculum,
  getCurriculumById,
  deleteCurriculum,
};
