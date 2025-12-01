const { spawn } = require("child_process");

function run(cmd, args, opts = {}) {
  return spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
}

let shuttingDown = false;

function cleanup() {
  if (shuttingDown) return;
  shuttingDown = true;

  const down = run("yarn services:down");
  down.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

async function main() {
  const up = run("yarn services:up");
  up.on("exit", (code) => {
    if (code !== 0) {
      process.exit(code);
    }
  });

  up.on("close", () => {
    const dev = run("yarn workspaces foreach -ptvi run dev");

    // On Ctrl+C or process termination
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);

    dev.on("exit", (code) => {
      cleanup();
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
