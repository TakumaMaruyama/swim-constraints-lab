import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { copyFile, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStaticServer, parsePort } from "./serve.mjs";

let fixture;
let directory;
let server;
let port;
const html = "<!doctype html><title>Swim lesson</title>";
const script = "console.log('lesson');";

function get(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port, path, ...options }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString(),
      }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.end();
  });
}

before(async () => {
  fixture = await mkdtemp(join(tmpdir(), "swim-static-"));
  directory = join(fixture, "dist");
  await mkdir(join(directory, "assets"), { recursive: true });
  await mkdir(join(directory, "empty"));
  await writeFile(join(directory, "index.html"), html);
  await writeFile(join(directory, "assets", "index-ABC12345.js"), script);
  await writeFile(join(directory, "assets", "style-ABC12345.css"), "body{color:blue}");
  await writeFile(join(directory, "icon.svg"), "<svg />");
  await writeFile(join(directory, "案.txt"), "レッスン");
  await writeFile(join(directory, ".env"), "private");
  await writeFile(join(fixture, "private.txt"), "outside dist");
  await symlink(join(fixture, "private.txt"), join(directory, "leak.txt"));
  await symlink(join(directory, ".env"), join(directory, "hidden.txt"));
  await symlink(join(directory, "index.html"), join(directory, "inside.html"));
  server = await createStaticServer(directory);
  server.listen(0, "0.0.0.0");
  await once(server, "listening");
  assert.equal(server.address().address, "0.0.0.0");
  port = server.address().port;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (fixture) await rm(fixture, { recursive: true, force: true });
});

test("serves the built index, assets and encoded filenames with correct types", async () => {
  const index = await get("/?lesson=1");
  assert.equal(index.status, 200);
  assert.equal(index.body, html);
  assert.equal(index.headers["content-type"], "text/html; charset=utf-8");
  assert.equal(index.headers["x-content-type-options"], "nosniff");
  const js = await get("/assets/index-ABC12345.js?v=1");
  assert.equal(js.body, script);
  assert.equal(js.headers["content-type"], "text/javascript; charset=utf-8");
  assert.equal((await get("/assets/style-ABC12345.css")).headers["content-type"], "text/css; charset=utf-8");
  assert.equal((await get("/icon.svg")).headers["content-type"], "image/svg+xml");
  assert.equal((await get(`/${encodeURIComponent("案.txt")}`)).body, "レッスン");
  assert.equal((await get("/inside.html")).body, html);
});

test("HEAD returns GET headers without a response body, including errors", async () => {
  for (const path of ["/", "/assets/index-ABC12345.js", "/missing.js", "/%00"]) {
    const actual = await get(path, { method: "HEAD" });
    const expected = await get(path);
    assert.equal(actual.status, expected.status);
    assert.equal(actual.headers["content-length"], expected.headers["content-length"]);
    assert.equal(actual.headers["content-type"], expected.headers["content-type"]);
    assert.equal(actual.body, "");
  }
});

test("revalidates HTML and unversioned files; caches only fingerprinted assets", async () => {
  for (const path of ["/", "/index.html", "/icon.svg"]) {
    assert.equal((await get(path)).headers["cache-control"], "no-cache");
  }
  const first = await get("/assets/index-ABC12345.js");
  assert.equal(first.headers["cache-control"], "public, max-age=31536000, immutable");
  const repeated = await get("/assets/index-ABC12345.js", {
    headers: { "If-None-Match": `"other", W/${first.headers.etag}` },
  });
  assert.equal(repeated.status, 304);
  assert.equal(repeated.body, "");
  assert.equal(repeated.headers.etag, first.headers.etag);
  assert.equal((await get("/", { headers: { "If-None-Match": "*" } })).status, 304);
  const previousIndex = await get("/");
  await writeFile(join(directory, "index.html"), `${html}updated`);
  try {
    const updated = await get("/", { headers: { "If-None-Match": previousIndex.headers.etag } });
    assert.equal(updated.status, 200);
    assert.equal(updated.body, `${html}updated`);
    assert.notEqual(updated.headers.etag, previousIndex.headers.etag);
  } finally {
    await writeFile(join(directory, "index.html"), html);
  }
});

test("SPA fallback is limited to extensionless HTML navigation", async () => {
  const route = await get("/staff/lesson?view=print", { headers: { Accept: "text/html" } });
  assert.equal(route.status, 200);
  assert.equal(route.body, html);
  assert.equal(route.headers["cache-control"], "no-cache");
  assert.equal(route.headers.vary, "Accept");
  assert.equal((await get("/staff/lesson")).status, 404);
  const head = await get("/staff/lesson", { method: "HEAD", headers: { Accept: "text/html" } });
  assert.equal(head.status, 200);
  assert.equal(head.body, "");
});

test("missing assets, API paths and directories return non-cacheable 404, never HTML", async () => {
  for (const path of ["/assets/missing.js", "/assets/missing", "/api/lesson", "/missing.css", "/empty/", "/assets/"]) {
    const result = await get(path, { headers: { Accept: "text/html" } });
    assert.equal(result.status, 404, path);
    assert.equal(result.body, "Not found\n", path);
    assert.equal(result.headers["cache-control"], "no-store");
  }
});

test("rejects raw and encoded traversal, backslashes, control characters and malformed encoding", async () => {
  for (const path of ["/../private.txt", "/%2e%2e/private.txt", "/assets/%2E%2E%2findex.html", "/.%2e/private.txt", "/%5c..%5cprivate.txt", "/%00", "/%0a", "/%ff", "/%", "//index.html"]) {
    const result = await get(path, { headers: { Accept: "text/html" } });
    assert.equal(result.status, 400, path);
    assert.equal(result.body, "Bad request\n");
  }
});

test("cannot expose dotfiles, source files or symlinks outside the public tree", async () => {
  for (const path of ["/.env", "/.git/config", "/%2eenv", "/src/main.tsx", "/package.json", "/server/serve.mjs", "/leak.txt", "/hidden.txt"]) {
    const result = await get(path, { headers: { Accept: "text/html" } });
    assert.equal(result.status, 404, path);
    assert.equal(result.body, "Not found\n");
  }
});

test("unsupported HTTP methods are rejected", async () => {
  for (const method of ["POST", "PUT", "DELETE", "OPTIONS"]) {
    const result = await get("/", { method });
    assert.equal(result.status, 405);
    assert.equal(result.headers.allow, "GET, HEAD");
    assert.equal(result.headers["cache-control"], "no-store");
  }
});

test("requires a built index before accepting requests", async () => {
  await assert.rejects(createStaticServer(join(fixture, "missing")), /npm run build/);
  await assert.rejects(createStaticServer(join(directory, "empty")), /npm run build/);
});

test("validates platform PORT and uses port 5000 when unset", () => {
  assert.equal(parsePort(undefined), 5000);
  assert.equal(parsePort("4173"), 4173);
  assert.equal(parsePort("65535"), 65535);
  for (const value of ["", "0", "65536", "-1", "2.5", "5000x", " 5000", "1e3"]) {
    assert.throws(() => parsePort(value), /PORT must be/);
  }
});

test("CLI honors PORT, serves module-relative dist, and shuts down on SIGTERM", { timeout: 10_000 }, async () => {
  await mkdir(join(fixture, "server"));
  await copyFile(new URL("./serve.mjs", import.meta.url), join(fixture, "server", "serve.mjs"));
  const temporary = await createStaticServer(directory);
  temporary.listen(0, "127.0.0.1");
  await once(temporary, "listening");
  const cliPort = temporary.address().port;
  await new Promise((resolve) => temporary.close(resolve));
  const child = spawn(process.execPath, [join(fixture, "server", "serve.mjs")], {
    cwd: tmpdir(), env: { ...process.env, PORT: String(cliPort) }, stdio: ["ignore", "pipe", "pipe"],
  });
  let errors = "";
  child.stderr.on("data", (chunk) => { errors += chunk.toString(); });
  try {
    const output = await Promise.race([
      once(child.stdout, "data", { signal: AbortSignal.timeout(5000) }).then(([chunk]) => chunk.toString()),
      once(child, "exit").then(([code]) => { throw new Error(`Server exited before listening (${code}): ${errors}`); }),
    ]);
    assert.match(output, new RegExp(`0\\.0\\.0\\.0:${cliPort}`));
    assert.equal((await get("/", { port: cliPort })).body, html);
    child.kill("SIGTERM");
    const [code] = await once(child, "exit", { signal: AbortSignal.timeout(5000) });
    assert.equal(code, 0);
  } finally {
    child.kill("SIGKILL");
  }
});
