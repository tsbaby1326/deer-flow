import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { env } from "process";

export async function main() {
  const threadId = process.argv[2];
  const url = new URL(
    `http://localhost:2026/api/langgraph/threads/${threadId}/history`,
  );
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      limit: 10,
    }),
  });

  const data = (await response.json())[0];
  if (!data) {
    console.error("No data found");
    return;
  }

  const title = data.values.title;

  const rootPath = path.resolve(process.cwd(), "public/demo/threads", threadId);
  if (fs.existsSync(rootPath)) {
    fs.rmSync(rootPath, { recursive: true });
  }
  fs.mkdirSync(rootPath, { recursive: true });
  fs.writeFileSync(
    path.resolve(rootPath, "thread.json"),
    JSON.stringify(data, null, 2),
  );
  const backendRootPath = path.resolve(
    process.cwd(),
    "../backend/.deer-flow/threads",
    threadId,
  );
  const outputsPath = path.resolve(backendRootPath, "user-data/outputs");
  if (fs.existsSync(outputsPath)) {
    fs.cpSync(outputsPath, path.resolve(rootPath, "user-data/outputs"), {
      recursive: true,
    });
  }
  console.info(`Saved demo "${title}" to ${rootPath}`);
}

config();
main();
