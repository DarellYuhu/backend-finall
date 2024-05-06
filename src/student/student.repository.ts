import prisma from "../database";

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

export default { getStudentOnRps };
