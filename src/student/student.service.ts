import { TStudentXlsx } from "../../global";
import { xlsxFileSchema } from "../schemas";
import { extractXlsx } from "../utils";
import studentRepository from "./student.repository";

const createManyStudent = async (file: Express.Multer.File) => {
  await xlsxFileSchema.validate({ file });
  const data = extractXlsx(file);
  const normalize = data.map((data: TStudentXlsx) => ({
    nim: data.nim?.toString(),
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNo: data.phoneNo?.toString(),
    gender: data.gender,
    major: data.major,
    religion: data.religion,
    currentResidenceStatus: data.currentResidenceStatus,
    studentEmail: data.studentEmail,
    address: data.address,
    curriculumId: data.curriculumId,
    guardianName: data.guardianName,
    familyRelation: data.familyRelation,
    reg_num: data.reg_num,
    arrivalYear: data.arrivalYear?.toString(),
  }));

  return await studentRepository.createManyStudentTransaction(normalize);
};

export default { createManyStudent };
