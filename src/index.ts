import express, { Application, Router } from "express";
import http from "http";
import Config from "./config/config";
import cors from "cors";
import morgan from "morgan";
import path from "path";

//Router List
import RouterPing from "./routes/ping";
import RouterCurriculum from "./routes/curriculum";
import RouterSubject from "./routes/subject";
import RouterRps from "./routes/rps";
import RouterStudentGrade from "./routes/studentGrade";
import RouterReportSummary from "./routes/reportSummary";
import RouterReportDetail from "./routes/reportDetail";

// Controller
import CurriculumController from "./curriculum/curriculum.controller";
import RpsController from "./rps/rps.controller";
import ReportDetailController from "./reportDetail/reportDetail.controller";
import ReportsummaryController from "./reportSummary/reportSummary.controller";
import StudentGradeController from "./studentGrade/studentGrade.controller";
import SubjectController from "./subject/subject.controller";
import StudentController from "./student/student.controller";
import EmployeeController from "./employee/employee.controller";

const app: Application = express();
const httpServer = http.createServer(app);
const RouterApi = Router();

app.use(express.json());
app.use(morgan("tiny"));
app.use("/static", express.static(path.join(__dirname, "../public")));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://outcome-based.vercel.app",
      "https://filkom.investsulut.id",
      "https://hgdxm2td-3000.asse.devtunnels.ms",
    ],
  })
);

app.use("/api", RouterApi);
(async () => {
  try {
    RouterApi.use("/ping", RouterPing);
    RouterApi.use("/curriculum", CurriculumController);
    RouterApi.use("/subject", SubjectController);
    RouterApi.use("/rps", RpsController);
    RouterApi.use("/student-grade", StudentGradeController);
    RouterApi.use("/report-summary", ReportsummaryController);
    RouterApi.use("/report-detail", ReportDetailController);
    RouterApi.use("/student", StudentController);
    RouterApi.use("/employee", EmployeeController);

    httpServer.listen(Config.PORT, () =>
      console.log(`Server running on port ${Config.PORT}`)
    );
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

// trigger deployment
