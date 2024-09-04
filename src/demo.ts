import f from "fastify";
import { render } from "./index.js";

const fastify = f({
  // Set this to true for detailed logging:
  logger: false,
});

fastify.get("/", function (request, reply) {
  let html = render();

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
      <style>
      body {
        font-family: "Noto Sans CJK SC", sans-serif;
        margin: 2em;
        padding: 2em;
      }
      * {
        box-sizing: border-box;
      }
      .rem ul, .rem ol {
        padding-inline-start: 5ch;
        list-style: initial;
      }
      .rem ol {
        list-style-type: decimal;
      }
      .rem ol ol {
        list-style-type: lower-alpha;
      }
      .rem ol ol ol {
        list-style-type: lower-roman;
      }
      .rem li:has(details) {
        margin-inline-start: -2ch;
      }
      .rem ul li:has(details) {
        list-style-type: none; /* hide the marker of li */
      }

      .rem details {
          position: relative;
      }
      .rem details[open]:before {
          content: "";
          position: absolute;
          inset-inline-start: .5ch;
          inset-block-start: 1em;
          inset-block-end: 2px;
          border-inline-start: 2px dashed #333;
          z-index: -1;
        }

:target {
  animation: highlight 1s ease-in-out 4;
  background-color: rgba(253, 224, 71, .8);
}
@keyframes highlight {
    from {
        background-color: rgba(253, 224, 71, .8);
    }
    50% {
        background-color: rgba(253, 224, 71, .3);
    }
    to {
        background-color: rgba(253, 224, 71, .8);
    }
}

          span.cloze {
  font-weight: 600;
  color: #008007;
}
span.cloze input {
  display: none;
}
span.cloze input:checked + label {
  display: none;
}
span.cloze input:checked + label + label {
  display: unset;
}
span.cloze input + label {
  cursor: zoom-in;
}
span.cloze input + label + label {
  display: none;
  cursor: zoom-out;
}

pre.math-display:not(:only-child) {
  display: inline-block;
}
        </style>
        </head>
      <body class="rem">
      <div>
    <h1>Rem</h1>
    ${html}
    </div>
    </body>
    </html>`);
});

// Run the server and report out to the logs
fastify.listen(
  { port: 3117, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
