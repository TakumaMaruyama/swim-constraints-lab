import { createHash } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultDirectory = fileURLToPath(new URL("../dist", import.meta.url));
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

class NotPublicFile extends Error {}

/** @param {unknown} error */
function isMissing(error) {
  return error instanceof Error && "code" in error &&
    ["ENOENT", "ENOTDIR"].includes(String(error.code));
}

/** @param {string} root @param {string} pathname */
async function readPublicFile(root, pathname) {
  try {
    const filename = await realpath(resolve(root, `.${pathname}`));
    const local = relative(root, filename);
    // realpath also prevents a symlink inside dist from exposing outside files.
    if (isAbsolute(local) || local.split(sep).some((part) => part.startsWith("."))) {
      throw new NotPublicFile();
    }
    if (!(await stat(filename)).isFile()) throw new NotPublicFile();
    return await readFile(filename);
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/** @param {string | undefined} value */
export function parsePort(value) {
  if (value === undefined) return 5000;
  const port = Number(value);
  if (!/^\d+$/.test(value) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer from 1 to 65535.");
  }
  return port;
}

/**
 * Serves only a built frontend. No source files, request logging or persistence.
 * @param {string} directory
 */
export async function createStaticServer(directory = defaultDirectory) {
  let root;
  try {
    root = await realpath(directory);
    if (!(await readPublicFile(root, "/index.html"))) throw new NotPublicFile();
  } catch {
    throw new Error("Built dist/index.html is unavailable. Run npm run build first.");
  }

  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    /** @param {number} status @param {string} message */
    const fail = (status, message) => {
      response.writeHead(status, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": Buffer.byteLength(message),
        "Cache-Control": "no-store",
      });
      response.end(request.method === "HEAD" ? undefined : message);
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      request.resume();
      response.setHeader("Allow", "GET, HEAD");
      fail(405, "Method not allowed\n");
      return;
    }

    let pathname;
    try {
      // Do not normalize via URL before checking encoded traversal segments.
      pathname = decodeURIComponent((request.url ?? "/").split(/[?#]/, 1)[0]);
      if (!pathname.startsWith("/") || pathname.startsWith("//") ||
          // eslint-disable-next-line no-control-regex -- Reject decoded control bytes in request paths.
          /[\u0000-\u001f\u007f\\]/.test(pathname) ||
          pathname.split("/").some((part) => part === "." || part === "..")) {
        throw new URIError();
      }
    } catch {
      fail(400, "Bad request\n");
      return;
    }
    if (pathname.split("/").some((part) => part.startsWith("."))) {
      fail(404, "Not found\n");
      return;
    }

    try {
      let servedPath = pathname === "/" ? "/index.html" : pathname;
      let bytes = await readPublicFile(root, servedPath);
      const navigation = request.headers.accept?.includes("text/html") &&
        !extname(pathname) && !/^\/(assets|api)(\/|$)/.test(pathname);
      if (bytes === null && navigation) {
        servedPath = "/index.html";
        bytes = await readPublicFile(root, servedPath);
      }
      if (bytes === null) {
        fail(404, "Not found\n");
        return;
      }

      const fingerprinted = /^\/assets\/.+-[\w-]{8,}\.[\w]+$/.test(servedPath);
      response.setHeader("Content-Type", contentTypes.get(extname(servedPath)) ?? "application/octet-stream");
      response.setHeader("Cache-Control", fingerprinted ? "public, max-age=31536000, immutable" : "no-cache");
      // Extensionless navigation has different results from asset/API requests.
      if (!extname(pathname)) response.setHeader("Vary", "Accept");
      const etag = `"${createHash("sha256").update(bytes).digest("hex")}"`;
      response.setHeader("ETag", etag);
      const matches = request.headers["if-none-match"]?.split(",")
        .some((candidate) => candidate.trim() === "*" || candidate.trim().replace(/^W\//, "") === etag);
      if (matches) {
        response.writeHead(304);
        response.end();
        return;
      }
      response.writeHead(200, { "Content-Length": bytes.length });
      response.end(request.method === "HEAD" ? undefined : bytes);
    } catch (error) {
      fail(error instanceof NotPublicFile ? 404 : 500,
        error instanceof NotPublicFile ? "Not found\n" : "Internal server error\n");
    }
  });
}

if (process.argv[1] && pathToFileURL(await realpath(process.argv[1])).href === import.meta.url) {
  try {
    const port = parsePort(process.env.PORT);
    const server = await createStaticServer();
    server.on("error", (error) => {
      console.error(`Static server failed: ${error.message}`);
      process.exitCode = 1;
    });
    server.listen(port, "0.0.0.0", () => {
      console.log(`Static server listening on 0.0.0.0:${port}`);
    });
    for (const signal of ["SIGTERM", "SIGINT"]) {
      process.once(signal, () => {
        server.close();
        setTimeout(() => server.closeAllConnections(), 10_000).unref();
      });
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Static server failed.");
    process.exitCode = 1;
  }
}
