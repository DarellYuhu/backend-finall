import express, { Application, Router } from "express";
import http from "http";
import Config from "./config/config";
import cors from "cors";
import morgan from "morgan";

//Router List
import RouterPing from "./routes/ping";
import RouterCurriculum from "./routes/curriculum";
import RouterSubject from "./routes/subject";
import RouterRps from "./routes/rps";
import RouterStudentGrade from "./routes/studentGrade";
import RouterReportSummary from "./routes/reportSummary";
import RouterReportDetail from "./routes/reportDetail";
import path from "path";

// Controller
import CurriculumController from "./curriculum/curriculum.controller";
import RpsController from "./rps/rps.controller";

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
    RouterApi.use("/subject", RouterSubject);
    RouterApi.use("/rps", RpsController);
    RouterApi.use("/student-grade", RouterStudentGrade);
    RouterApi.use("/report-summary", RouterReportSummary);
    RouterApi.use("/report-detail", RouterReportDetail);

    httpServer.listen(Config.PORT, () =>
      console.log(`Server running on port ${Config.PORT}`)
    );
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

// trigger deployment
