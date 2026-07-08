import { spawn, spawnSync } from "node:child_process"

const cwd = process.cwd()
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
const healthUrl = `${baseURL}/login`
const timeoutMs = 180_000
const nextArgs = [
  "./node_modules/next/dist/bin/next",
  "dev",
  "--hostname",
  "127.0.0.1",
  "--port",
  "3000",
]
const playwrightArgs = [
  "./node_modules/@playwright/test/cli.js",
  "test",
  ...process.argv.slice(2),
]

let bufferedServerOutput = ""
let server
let shuttingDown = false

function appendServerOutput(chunk) {
  bufferedServerOutput += chunk.toString()

  if (bufferedServerOutput.length > 8_000) {
    bufferedServerOutput = bufferedServerOutput.slice(-8_000)
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForServer() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(healthUrl, {
        redirect: "manual",
      })

      if (response.ok || response.status === 307 || response.status === 308) {
        return
      }
    } catch {}

    await delay(1_000)
  }

  throw new Error(
    `Timed out waiting for ${healthUrl}.\n\nLast Next.js output:\n${bufferedServerOutput}`
  )
}

function stopServer() {
  if (shuttingDown || !server?.pid) {
    return
  }

  shuttingDown = true

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    })
    return
  }

  server.kill("SIGTERM")
}

function wireProcessSignals() {
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      stopServer()
      process.exit(1)
    })
  }
}

async function main() {
  wireProcessSignals()

  server = spawn(process.execPath, nextArgs, {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  })

  server.stdout?.on("data", appendServerOutput)
  server.stderr?.on("data", appendServerOutput)

  await waitForServer()

  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, playwrightArgs, {
      cwd,
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_WEBSERVER: "1",
      },
      stdio: "inherit",
    })

    child.on("exit", (code) => {
      resolve(code ?? 1)
    })
    child.on("error", reject)
  })

  stopServer()
  process.exit(result)
}

main().catch((error) => {
  stopServer()
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
