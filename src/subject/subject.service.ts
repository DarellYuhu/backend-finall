import { Subject_Cpl } from "../../global";
import subjectRepository from "./subject.repository";
import { response as res } from "express";

const getAllSubject = async () => {
  return await subjectRepository.getAllSubject();
};

const getSubjectById = async (id: string) => {
  return await subjectRepository.getSubjectById(id);
};

const getPrerequisiteSubject = async (id: string) => {
  const data = await subjectRepository.getSubjectById(id);
  const Prerequisite = await subjectRepository.getPrerequisiteSubject(data);
  delete data.Curriculum_Subject;
  return { ...data, Prerequisite };
};

const mapSubjectCpl = async (cplIds: string[], id: string) => {
  const payload: Subject_Cpl[] = cplIds.map((cplId: string) => {
    return {
      cplId,
      subjectId: id,
    };
  });
  return await subjectRepository.mapCplTransaction(cplIds, id, payload);
};

const getSubjectCpl = async (id: string) => {
  const data = await subjectRepository.getSubjectCpl(id);
  if (!data) {
    return res.status(404).json({
      status: false,
      message: "Data not found",
    });
  }
  return data;
};

export default {
  getAllSubject,
  getSubjectById,
  getPrerequisiteSubject,
  mapSubjectCpl,
  getSubjectCpl,
};
