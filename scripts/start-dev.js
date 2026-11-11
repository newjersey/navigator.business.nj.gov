const { spawn } = require("child_process");

function run(cmd, args, opts = {}) {
  return spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
}

let shuttingDown = false;

function cleanup() {
  if (shuttingDown) return;
  shuttingDown = true;

  const down = run("pnpm run services:down");
  down.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

async function main() {
  const up = run("pnpm run services:up");
  up.on("exit", (code) => {
    if (code !== 0) {
      process.exit(code);
    }
  });

  up.on("close", () => {
    const dev = run(
      "pnpm --filter @businessnjgovnavigator/content run dev && " +
        "pnpm --filter @businessnjgovnavigator/shared run dev && " +
        "pnpm -r --parallel --filter @businessnjgovnavigator/api " +
        "--filter @businessnjgovnavigator/web run dev",
    );

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
