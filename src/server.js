import dotenv from "dotenv";
import app from "./app.js";
import { startPlantDegrader } from "./cron/plantDegrader.js";

dotenv.config();

const port = Number(process.env.PORT) || 4000;
const host= '0.0.0.0'

app.listen(port, host, () => {
  console.log(`Server is running on port ${host}:${port}`);

  startPlantDegrader();
});