import { Rps } from "@prisma/client";
import prisma from "../database";

type query = {
  major?: string;
  curriculumId?: string;
};

const getRpsById = async (id: string) => {
  const data = await prisma.rps.findUnique({
    where: {
      id,
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      Subject: {
        include: {
          Subject_Cpl: {
            include: {
              cpl: true,
            },
          },
          Curriculum_Subject: {
            include: {
              curriculum: true,
            },
          },
        },
      },
      MeetingPlan: true,
      StudentAssignmentPlan: true,
      CpmkGrading: {
        include: {
          GradingSystem: true,
        },
      },
      Cpmk: {
        include: {
          SupportedCpl: {
            include: {
              cpl: true,
            },
          },
        },
      },
    },
  });

  const Prerequisite = data?.Subject.Curriculum_Subject.map(async (item) => ({
    curriculum: item.curriculum,
    prerequisite: await prisma.subject.findMany({
      where: {
        code: {
          in: item.prerequisite,
        },
      },
    }),
  }));

  return { ...data, Prerequisite };
};

const getAllRps = async (query: query) => {
  const { major, curriculumId } = query;
  return await prisma.rps.findMany({
    where: {
      Subject: {
        Curriculum_Subject: {
          some: {
            curriculum: {
              OR: [{ major: major as string }, { id: curriculumId as string }],
            },
          },
        },
      },
    },
    select: {
      id: true,
      status: true,
      Subject: {
        select: {
          code: true,
          indonesiaName: true,
          englishName: true,
          Curriculum_Subject: {
            select: {
              semester: true,
              curriculum: {
                select: {
                  major: true,
                },
              },
            },
          },
        },
      },
      teacher: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      updatedAt: true,
      _count: {
        select: {
          ClassStudent: true,
        },
      },
    },
  });
};

const deleteRps = async (id: string) => {
  return await prisma.rps.delete({
    where: {
      id,
    },
  });
};

const updateRps = async (id: string, payload: Rps) => {
  const { status } = payload;
  return await prisma.rps.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

export default { getRpsById, getAllRps, deleteRps, updateRps };
