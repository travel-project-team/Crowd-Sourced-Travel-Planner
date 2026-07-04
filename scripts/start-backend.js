// Starts the backend server in a virtual environment

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Create file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, "../backend");

// Determine Window or Mac/Linux OS
const pythonPath =
  process.platform === "win32"
    ? path.join(backendDir, "venv", "Scripts", "python.exe")
    : path.join(backendDir, "venv", "bin", "python");

// Check venv exists
if (!fs.existsSync(pythonPath)) {
  console.error(
    "Backend virtual environment not found. Create it with: python -m venv venv (inside backend folder)."
  );
  process.exit(1);
}

// Start backend server
const backend = spawn(pythonPath, ["src/main.py"], {
  cwd: backendDir,
  stdio: "inherit",
});

backend.on("close", (code) => process.exit(code));