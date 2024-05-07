import { Role } from "@prisma/client";
import prisma from "../database";
import { TStudentXlsx } from "../../global";

const getStudentOnRps = async (rpsId: string) => {
  return await prisma.student.findMany({
    where: {
      ClassStudent: {
        some: {
          rpsId,
        },
      },
    },
    select: {
      firstName: true,
      lastName: true,
      nim: true,
      id: true,
      StudentGrade: true,
    },
  });
};

const createManyStudentTransaction = async (data: TStudentXlsx[]) => {
  return await prisma.$transaction(async (prisma) => {
    const totalInsert = await prisma.student.createMany({
      data,
      skipDuplicates: true,
    });

    const students = await prisma.student.findMany({
      where: {
        nim: {
          in: data.map((item) => item.nim),
        },
      },
      select: {
        id: true,
      },
    });

    const rolePaylod: { userId: string; role: Role }[] = students.map(
      (item) => {
        return {
          userId: item.id,
          role: "MAHASISWA",
        };
      }
    );

    await prisma.userRole.createMany({
      data: rolePaylod,
      skipDuplicates: true,
    });

    return totalInsert.count;
  });
};

export default { getStudentOnRps, createManyStudentTransaction };
