import prisma from "../database";
import { Cpl, CurriculumFile } from "../../global";
import { Major } from "@prisma/client";

type CreateCurriculumParams = {
  data: CurriculumFile[];
  major: Major;
  year: string;
  headOfProgramStudyId: string;
};

const createCurriculum = async ({
  data,
  major,
  year,
  headOfProgramStudyId,
}: CreateCurriculumParams) => {
  return await prisma.$transaction(async (prisma) => {
    const curriculum = await prisma.curriculum.create({
      data: {
        major,
        year,
        headOfProgramStudyId,
      },
    });

    const subjectPayload = data.map((subject) => {
      const { prerequisite, semester, ...rest } = subject;
      return rest;
    });

    await prisma.subject.createMany({
      data: subjectPayload,
      skipDuplicates: true,
    });

    const subjects = await prisma.subject.findMany({
      where: {
        code: {
          in: data.map((subject) => subject.code),
        },
      },
      select: {
        id: true,
        code: true,
      },
    });

    await prisma.curriculum_Subject.createMany({
      data: subjects.map((subject) => ({
        curriculumId: curriculum.id,
        subjectId: subject.id,
        prerequisite:
          data.find((data) => data.code === subject.code)?.prerequisite || [],
        semester: data.find((data) => data.code === subject.code).semester,
      })),
    });

    return await prisma.curriculum.findUnique({
      where: {
        id: curriculum.id,
      },
      include: {
        _count: {
          select: {
            Curriculum_Subject: true,
          },
        },
        Curriculum_Subject: {
          include: {
            subject: true,
          },
        },
      },
    });
  });
};

const createCurriculumCpl = async (data: Cpl[], curriculumId: string) => {
  return await prisma.$transaction(async (prisma) => {
    await prisma.cpl.createMany({
      data,
    });
    return await prisma.cpl.findMany({
      where: {
        curriculumId,
      },
    });
  });
};

const getAllCurriculum = async (major: string) => {
  return await prisma.curriculum.findMany({
    where: {
      major,
    },
    select: {
      id: true,
      major: true,
      year: true,
      headOfProgramStudy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          Curriculum_Subject: true,
        },
      },
    },
  });
};

const getCurriculumById = async (id: string) => {
  return await prisma.curriculum.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      major: true,
      year: true,
      Cpl: true,
      Curriculum_Subject: {
        select: {
          subject: {
            select: {
              id: true,
              code: true,
              englishName: true,
              indonesiaName: true,
              Subject_Cpl: {
                select: {
                  cpl: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

const deleteCurriculumTransaction = async (id: string) => {
  return await prisma.$transaction(async (prisma) => {
    const data = await prisma.curriculum.delete({
      where: {
        id,
      },
    });

    await prisma.rps.deleteMany({
      where: {
        Subject: {
          Curriculum_Subject: {
            some: {
              curriculumId: id,
            },
          },
        },
      },
    });

    return data;
  });
};

export default {
  createCurriculum,
  createCurriculumCpl,
  getAllCurriculum,
  getCurriculumById,
  deleteCurriculumTransaction,
};
