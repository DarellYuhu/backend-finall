import { TEmployeeXlsx } from "../../global";
import { xlsxFileSchema } from "../schemas";
import { extractXlsx } from "../utils";
import employeeRepository from "./employee.repository";

const createManyEmployee = async (file: Express.Multer.File) => {
  await xlsxFileSchema.validate({ file });
  const data = extractXlsx(file);
  const normalize = data.map((item: TEmployeeXlsx) => ({
    nik: item.nik?.toString(),
    firstName: item?.firstName,
    lastName: item.lastName,
    role: item.role,
    major: item.major,
    email: item.email,
    phoneNum: item.phoneNum?.toString(),
  }));

  return employeeRepository.createManyEmployeeTransaction(normalize);
};

export default { createManyEmployee };
