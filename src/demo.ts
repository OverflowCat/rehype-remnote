import f from "fastify";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_CONFIG, hydrate, hydrate2Html, rem2Html } from "./index.js";
import {
  /// @type {Workspace}
  workspace,
} from "../test.js";

const fastify = f({
  // Set this to true for detailed logging:
  logger: false,
});

const useHydration = false;

const docHook = (tdoc, _) => {
  console.info(`${++counter} / ${total}`);
  return tdoc;
};

const total = workspace.docs.length;
let counter = 0;

if (useHydration) {

  const hydrated = JSON.stringify(hydrate(workspace));

  fs.writeFileSync("hydrated.json", hydrated);
  const html = hydrate2Html(
    JSON.parse(fs.readFileSync("hydrated.json", "utf-8")),
    {
      ...DEFAULT_CONFIG,
      unwrapRoot: true,
      docHook,
    }
  );
}
else {
  var html = rem2Html(workspace, {
    ...DEFAULT_CONFIG,
    docHook
  });
}

fastify.get("/", (request, reply) => {
  return reply.code(200).type("text/html").send(`
      <!DOCTYPE html>
      <html>
      <head>
      <title>Rem</title>
      <!-- encoding -->
      <meta charset="utf-8">
      <!-- responsive -->
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="/style/body.css">
      <link rel="stylesheet" href="/style/cloze.css">
      <link rel="stylesheet" href="/style/math.css">
      <link rel="stylesheet" href="/style/mini.css">
      <link rel="stylesheet" href="/style/target.css">
      </head>
      <body class="rem">
      <div>
    <h1>Rem</h1>
    ${html}
    </div>
    </body>
    </html>`);
});

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the ../style directory
fastify.register(import('@fastify/static'), {
  root: path.join(__dirname, '../style'),
  prefix: '/style/', // optional: add a prefix to the URL
});

// Run the server and report out to the logs
fastify.listen({ port: 3117, host: "localhost" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Demo is live at ${address}`);
});
