import { Curriculum, Curriculum_Subject, Subject } from "@prisma/client";
import prisma from "../database";
import { Subject_Cpl } from "../../global";

const getAllSubject = async () => {
  return await prisma.subject.findMany({
    include: {
      Subject_Cpl: true,
    },
  });
};

const getSubjectById = async (id: string) => {
  return await prisma.subject.findUnique({
    where: {
      id,
    },
    include: {
      Subject_Cpl: {
        select: {
          id: true,
          cpl: true,
        },
      },
      Curriculum_Subject: {
        select: {
          curriculum: true,
          prerequisite: true,
        },
      },
    },
  });
};

const getPrerequisiteSubject = async (
  subject: Subject & {
    Curriculum_Subject: { curriculum: Curriculum; prerequisite: string[] }[];
  }
) => {
  return await Promise.all(
    subject?.Curriculum_Subject.map(async (item) => ({
      curriculum: item.curriculum,
      prerequisite: await prisma.subject.findMany({
        where: {
          code: {
            in: item.prerequisite,
          },
        },
      }),
    }))
  );
};

const mapCplTransaction = async (
  cplIds: string[],
  id: string,
  payload: Subject_Cpl[]
) => {
  return await prisma.$transaction(async (prisma) => {
    const deletedCpl = await prisma.subject_Cpl.findMany({
      where: {
        cplId: {
          notIn: cplIds,
        },
      },
    });

    await prisma.subject_Cpl.createMany({
      data: payload,
      skipDuplicates: true,
    });

    if (deletedCpl.length > 0) {
      await prisma.subject_Cpl.deleteMany({
        where: {
          cplId: {
            in: deletedCpl.map((cpl) => cpl.cplId),
          },
          subjectId: id,
        },
      });
    }

    return await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        Subject_Cpl: {
          select: {
            cpl: true,
          },
        },
      },
    });
  });
};

const getSubjectCpl = async (id: string) => {
  return await prisma.subject.findUnique({
    where: {
      id,
    },
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
              id: true,
            },
          },
        },
      },
      Curriculum_Subject: {
        select: {
          curriculum: {
            select: {
              id: true,
              major: true,
              year: true,
              Cpl: {
                select: {
                  id: true,
                  code: true,
                  description: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export default {
  getAllSubject,
  getSubjectById,
  getPrerequisiteSubject,
  mapCplTransaction,
  getSubjectCpl,
};
