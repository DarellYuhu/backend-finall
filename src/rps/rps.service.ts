import { Rps } from "@prisma/client";
import rpsRepository from "./rps.repository";

const getRpsById = async (id: string) => {
  return await rpsRepository.getRpsById(id);
};

const getAllRps = async (query: { major: string; curriculumId: string }) => {
  return await rpsRepository.getAllRps(query);
};

const deleteRps = async (id: string) => {
  return await rpsRepository.deleteRps(id);
};

const updateRps = async (id: string, payload: Rps) => {
  return rpsRepository.updateRps(id, payload);
};

export default { getRpsById, deleteRps, updateRps, getAllRps };
