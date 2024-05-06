import { ReportDetail } from "@prisma/client";
import studentRepository from "../student/student.repository";
import reportDetailRepository from "./reportDetail.repository";
import { response as res } from "express";
import rpsRepository from "../rps/rps.repository";

const createOrUpdateRps = async (id: string) => {
  const rps = await rpsRepository.getRpsById(id);
  if (!rps) {
    return res.status(404).json({
      status: false,
      message: "RPS not found",
    });
  }

  const students = await studentRepository.getStudentOnRps(id);

  if (students.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Students not found. Add students to the class first.",
    });
  }

  const groupGradingSystem = rps.CpmkGrading.map((item) => {
    return {
      code: item.code,
      studentList: students.map((student) => {
        const matchedGrade = item.GradingSystem.map((grading) => {
          const matchedStudentGrade = student.StudentGrade.find((grade) => {
            return grade.gradingSystemId === grading.id;
          });
          const rawGrade = matchedStudentGrade
            ? matchedStudentGrade.rawGrade
            : 0;
          const score = matchedStudentGrade ? matchedStudentGrade.score : 0;
          return {
            gradingName: grading.gradingName,
            gradingId: grading.id,
            rawGrade: rawGrade,
            score: score,
          };
        });
        return {
          name: `${student.firstName} ${student.lastName}`,
          nim: student.nim,
          grading: matchedGrade,
        };
      }),
    };
  });

  const normalize: Omit<ReportDetail, "createAt"> = {
    rpsId: rps.id,
    subjectName: `${rps.Subject.englishName} / ${rps.Subject.indonesiaName}`,
    major: rps.Subject.Curriculum_Subject.map(
      (item) => item.curriculum.major
    ).join(" | "),
    credits: rps.Subject.credits,
    parallel: rps.parallel,
    teacher: `${rps.teacher.firstName} ${rps.teacher.lastName}`,
    schedule: rps.schedule,
    gradingSystem: {},
    studentGrade: JSON.stringify(groupGradingSystem),
    updateAt: new Date(),
  };

  return await reportDetailRepository.createOrUpdateReportDetail(id, normalize);
};

const getReportDetail = async (id: string) => {
  const data = await reportDetailRepository.getReportDetail(id);
  if (!data) {
    return res.status(404).json({
      status: false,
      message: "Data not found",
    });
  }
  return data;
};

export default { createOrUpdateRps, getReportDetail };
