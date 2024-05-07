import {
  Cpmk,
  SubjectType,
  GradingSystem,
  CpmkGrading,
  MeetingPlan,
  StudentAssignmentPlan,
  gender,
  Major,
  Role,
} from "@prisma/client";
import { Request } from "express";

declare type CurriculumFile = {
  code: string;
  indonesiaName: string;
  englishName: string;
  credits: number;
  type: SubjectType;
  prerequisite?: string[];
  semester: number;
};

declare type Cpl = {
  code: string;
  description: string;
  curriculumId: string;
};

declare type Subject_Cpl = {
  cplId: string;
  subjectId: string;
};

type NewCpmkGrading = Omit<CpmkGrading, "id" | "rpsId"> & {
  gradingSystem: Pick<GradingSystem, "gradingName" | "gradingWeight">[];
};

declare type CreateRps = {
  teacherId: string;
  subjectId: string;
  subjectFamily: string;
  subjectDescription: string;
  parallel: string;
  schedule: string;
  rpsDeveloper: string;
  headOfExpertise: string;
  headOfProgramStudy: string;
  cpmk: ({ supportedCplIds: string[] } & Pick<Cpmk, "description" | "code">)[];
  cpmkGrading: NewCpmkGrading[];
  mainReferences: string[];
  supportingReferences: string[];
  software: string;
  hardware: string;
  teamTeaching: string[];
  minPassStudents: string;
  minPassGrade: string;
  meetingPlan: Omit<MeetingPlan, "id" | "rpdsId">[];
  studentAssignmentPlan: Omit<StudentAssignmentPlan, "id" | "rpsId">[];
};

declare type StudentGrade = { code: string; id: string; average: number };

declare type studentCpmkGradeType = {
  StudentGrade: StudentGrade;
  average: number;
  firstName: string;
  lastName: string;
  nim: string;
};

declare type TStudentXlsx = {
  nim: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  gender: gender;
  major: Major;
  religion: string;
  currentResidenceStatus: string;
  studentEmail: string;
  address: string;
  curriculumId: string;
  guardianName: string;
  familyRelation: string;
  reg_num: string;
  arrivalYear: string;
};

declare type TEmployeeXlsx = {
  nik: string;
  firstName: string;
  lastName: string;
  role: Role;
  major: Major;
  email: string;
  phoneNum: string;
};

interface ExtendedRequest extends Request {
  user: any; // Or a more specific type based on your user object
}
