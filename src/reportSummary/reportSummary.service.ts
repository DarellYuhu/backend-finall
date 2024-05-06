import { studentCpmkGradeType } from "../../global";
import rpsRepository from "../rps/rps.repository";
import studentRepository from "../student/student.repository";
import { convertShortMajor } from "../utils";
import reportSummaryRepository from "./reportSummary.repository";
import { response as res } from "express";

const createOrUpdateReportSummary = async (rpsId: string) => {
  const assessmentIndicator =
    await reportSummaryRepository.getAssessmentIndicator();
  const rps = await rpsRepository.getRpsById(rpsId);
  if (!rps) {
    return res.status(404).json({
      status: false,
      message: "RPS not found",
    });
  }
  const students = await studentRepository.getStudentOnRps(rpsId);

  const calculateGrade = (item: any) => {
    const averagePerCpmk = rps.CpmkGrading.reduce((acc: any, curr) => {
      const sumOfGrades = curr.GradingSystem.reduce((acc, curr) => {
        const targetGrade = item.StudentGrade.find(
          (item) => item.GradingSystem.id === curr.id
        );
        if (!targetGrade) return acc;
        return acc + targetGrade.score;
      }, 0);
      const average = (sumOfGrades / curr.totalGradingWeight) * 100;
      const result = { code: curr.code, id: curr.id, average };
      acc.push(result);
      return acc;
    }, []);
    const overallAvg = averagePerCpmk.reduce((total, item, index, array) => {
      total += item.average;
      if (index === array.length - 1) {
        total = total / array.length;
      }
      return total;
    }, 0);
    return { averagePerCpmk, overallAvg };
  };

  const studentCpmkGrade = students.map((item) => {
    const calculatedGrade = calculateGrade(item);
    return {
      ...item,
      maxGrade: calculatedGrade.averagePerCpmk.reduce((max, item) => {
        if (item.average > max.average) {
          return item;
        }
        return max;
      }, calculatedGrade.averagePerCpmk[0]),
      minGrade: calculatedGrade.averagePerCpmk.reduce((min, item) => {
        if (item.average < min.average) {
          return item;
        }
        return min;
      }, calculatedGrade.averagePerCpmk[0]),
      StudentGrade: calculatedGrade.averagePerCpmk,
      average: calculatedGrade.overallAvg,
    };
  });

  const calculateCpmkGradeSummary = (data: studentCpmkGradeType[]) => {
    const desctructering = data.map((item) => item.StudentGrade);
    const flatted = desctructering.flat();

    const totalAverage = flatted.reduce((accumulator, current) => {
      if (!accumulator[current.code]) {
        accumulator[current.code] = {
          code: current.code,
          sum: 0,
          count: 0,
          id: current.id,
        };
      }
      accumulator[current.code].sum += current.average;
      accumulator[current.code].count++;
      return accumulator;
    }, {});

    const avgEach = Object.values(totalAverage).map(
      (item: { [code: string]: number }) => ({
        id: item.id,
        code: item.code,
        average: item.sum / item.count,
      })
    );
    const overallAvg = avgEach.reduce((acc, curr, index, array) => {
      acc += curr.average;
      if (index === array.length - 1) acc /= array.length;
      return acc;
    }, 0);
    return { avgEach, overallAvg, maxItem, minItem };
  };

  const cpmkGradeSummary = calculateCpmkGradeSummary(studentCpmkGrade);
  const maxItem = cpmkGradeSummary.avgEach.reduce((max, item) => {
    if (item.average > max.average) {
      return item;
    }
    return max;
  }, cpmkGradeSummary.avgEach[0]);
  const minItem = cpmkGradeSummary.avgEach.reduce((min, item) => {
    if (item.average < min.average) {
      return item;
    }
    return min;
  }, cpmkGradeSummary.avgEach[0]);
  const status = assessmentIndicator.find((item) => {
    return (
      cpmkGradeSummary.overallAvg >= Math.floor(item.minScore) &&
      cpmkGradeSummary.overallAvg <= Math.floor(item.maxScore)
    );
  })?.description;

  const normalize = {
    rpsId: rps.id,
    credits: rps.Subject.credits,
    parallel: rps.parallel,
    schedule: rps.schedule,
    teacher: `${rps.teacher.firstName} ${rps.teacher.lastName}`,
    subjectName: `${rps.Subject.englishName} / ${rps.Subject.indonesiaName}`,
    major: rps.Subject.Curriculum_Subject.map((item) =>
      convertShortMajor(item.curriculum.major)
    ).join(" | "),
    semester: rps.Subject.Curriculum_Subject.map((item) => item.semester).join(
      " | "
    ),
    status,
    curriculum: rps.Subject.Curriculum_Subject.map(
      (item) => item.curriculum.year
    ).join(" | "),
    studentCpmkGrade,
    cpmkGradeSummary,
    highestCpmk: maxItem,
    lowestCpmk: minItem,
    updateAt: new Date(),
  };

  return reportSummaryRepository.createOrUpdateReportSummary(rpsId, normalize);
};

const getReportSummary = async (rpsId: string) => {
  const data = await reportSummaryRepository.getReportSummary(rpsId);
  if (!data) {
    return res.status(404).json({
      status: false,
      message: "Data not found",
    });
  }

  return data;
};

export default { createOrUpdateReportSummary, getReportSummary };
