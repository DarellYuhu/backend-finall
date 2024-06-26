import express from "express";
import { auth, validateSchema } from "../middleware";
import { createRpsSchema, xlsxFileSchema } from "../schemas";
import { CreateRps } from "../../global";
import prisma from "../database";
import { extractXlsx } from "../utils";
import multer from "multer";
import { ClassStudent, Major } from "@prisma/client";
import classMemberSchema from "../schemas/classMemberSchema";
import { count } from "console";

const upload = multer();
const RouterRps = express.Router();

RouterRps.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
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

    const Prerequisite = await Promise.all(
      data?.Subject.Curriculum_Subject.map(async (item) => ({
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

    res.json({
      status: true,
      message: "Success",
      data: { ...data, Prerequisite },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Rps not found",
        error,
      });
    }

    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.rps.delete({
      where: {
        id,
      },
    });
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Rps not found",
        error,
      });
    }

    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.patch("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const data = await prisma.rps.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Rps not found",
        error,
      });
    }

    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.get("/list/all", async (req, res) => {
  const { major, curriculumId } = req.query;
  try {
    const data = await prisma.rps.findMany({
      where: {
        Subject: {
          Curriculum_Subject: {
            some: {
              curriculum: {
                OR: [
                  { major: major as string },
                  { id: curriculumId as string },
                ],
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
    res.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.get("/list/major-summary", async (req, res) => {
  try {
    const data = await prisma.curriculum.findMany({
      select: {
        major: true,
        headOfProgramStudy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Curriculum_Subject: {
          select: {
            subject: {
              select: {
                Rps: {
                  select: {
                    teacherId: true,
                  },
                },
                _count: {
                  select: {
                    Rps: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const normalize = Object.keys(Major).map((key) => ({
      major: key,
      headOfProgramStudy: data.find((item) => item.major === key)
        ?.headOfProgramStudy,
      totalRps: data
        .find((item) => item.major === key)
        ?.Curriculum_Subject.reduce(
          (acc, curr) => acc + curr.subject._count.Rps,
          0
        ),
    }));

    const filter = normalize.filter(
      (item) => item.major !== "NONE" && item.major !== "DKV"
    );

    res.json({
      status: true,
      message: "Success",
      data: filter,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.get("/list/teacher/:teacherId", auth, async (req, res) => {
  const { teacherId } = req.params;
  try {
    const rps = await prisma.rps.findMany({
      where: {
        teacherId: teacherId as string,
      },
      select: {
        id: true,
        status: true,
        Subject: {
          select: {
            code: true,
            indonesiaName: true,
            englishName: true,
            credits: true,
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
    if (rps.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Data not found",
      });
    }
    const metadata = {
      teacher: rps[0]?.teacher,
      creditsTotal: rps.reduce((acc: any, curr) => {
        return acc + curr.Subject.credits;
      }, 0),
      studentsTotal: rps.reduce((acc: any, curr) => {
        return acc + curr._count.ClassStudent;
      }, 0),
      rpsTotal: rps.length,
    };
    res.json({
      status: true,
      message: "Success",
      data: { rps, metadata },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.post("/", auth, validateSchema(createRpsSchema), async (req, res) => {
  const body: CreateRps = req.body;
  try {
    const {
      cpmkGrading: cpmkGradingPayload,
      cpmk: cpmkPayload,
      studentAssignmentPlan,
      meetingPlan,
      ...rpsPayload
    } = body;
    const result = await prisma.$transaction(async (prisma) => {
      // create rps
      const rps = await prisma.rps.create({
        data: {
          ...rpsPayload,
          MeetingPlan: {
            createMany: {
              data: meetingPlan,
            },
          },
          StudentAssignmentPlan: {
            createMany: {
              data: studentAssignmentPlan,
            },
          },
        },
      });

      // insert grading system
      await Promise.all(
        cpmkGradingPayload.map(async (data) => {
          const { gradingSystem, ...payload } = data;
          await prisma.cpmkGrading.create({
            data: {
              rpsId: rps.id,
              ...payload,
              GradingSystem: {
                createMany: { data: gradingSystem },
              },
            },
          });
        })
      );

      // insert cpmk
      await Promise.all(
        cpmkPayload.map(async (data) => {
          const { supportedCplIds, ...payload } = data;
          await prisma.cpmk.create({
            data: {
              rpsId: rps.id,
              ...payload,
              SupportedCpl: {
                createMany: {
                  data: supportedCplIds.map((value) => ({ cplId: value })),
                },
              },
            },
          });
        })
      );

      return await prisma.rps.findUnique({
        where: {
          id: rps.id,
        },
        include: {
          CpmkGrading: {
            include: {
              GradingSystem: true,
            },
          },
          MeetingPlan: true,
          StudentAssignmentPlan: true,
          Cpmk: true,
        },
      });
    });

    res.status(201).json({
      status: true,
      message: "Rps created successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: false,
        message: "Conflict! please check dupplicate data or code",
        error,
      });
    }

    if (error.code === "P2003") {
      return res.status(404).json({
        status: false,
        message: "Subject or CPL not found",
        error,
      });
    }
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

RouterRps.post(
  "/:id/member",
  auth,
  upload.single("classMember"),
  validateSchema(xlsxFileSchema),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    try {
      const data = extractXlsx(file);
      const parsedData: Pick<ClassStudent, "rpsId" | "studentNim">[] = data.map(
        (row: any) => ({
          rpsId: id,
          studentNim: row.nim?.toString(),
        })
      );
      const students = await prisma.student.findMany({
        select: {
          nim: true,
        },
      });
      const unkownNim = parsedData
        .map((item) => item.studentNim)
        .filter((nim) => {
          return !students.find((student) => student.nim === nim);
        });
      if (unkownNim.length > 0) {
        return res.status(404).json({
          status: false,
          message: `These NIM didn't exist on database: ${unkownNim.join(
            ", "
          )}`,
        });
      }
      await classMemberSchema.validate(parsedData);
      const rps = await prisma.rps.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });
      if (!rps) {
        return res.status(404).json({
          status: false,
          message: "Rps not found",
        });
      }
      const result = await prisma.classStudent.createMany({
        data: parsedData,
        skipDuplicates: true,
      });
      res.status(201).json({
        status: true,
        message: "Member added to Rps",
        data: result,
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "Student already in the class",
          error,
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: false,
          message: "Validation error. Please provide correct data",
          error: error.errors,
        });
      }
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error,
      });
    }
  }
);

export default RouterRps;
