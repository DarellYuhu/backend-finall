import { TEmployeeXlsx } from "../../global";
import prisma from "../database";

const createManyEmployeeTransaction = async (data: TEmployeeXlsx[]) => {
  return await prisma.$transaction(async (prisma) => {
    const employeePayload = data.map((item) => {
      const { role, ...rest } = item;
      return rest;
    });
    const totalInsert = await prisma.employee.createMany({
      data: employeePayload,
      skipDuplicates: true,
    });

    const employees = await prisma.employee.findMany({
      where: {
        nik: {
          in: data.map((item) => item.nik),
        },
      },
      select: {
        id: true,
        nik: true,
      },
    });

    const rolePayload = employees.map((employee) => {
      return {
        userId: employee.id,
        role: data.find((item) => item.nik === employee.nik).role,
      };
    });

    await prisma.userRole.createMany({
      data: rolePayload,
      skipDuplicates: true,
    });

    return totalInsert;
  });
};

export default { createManyEmployeeTransaction };
