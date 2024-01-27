// https://github.com/chcunningham/atomics-post-message/blob/main/server.js
import fs from "node:fs";
import url from "node:url";
import path from "node:path";
import http from "node:http";
/*
http = require('http'),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
*/
const port = process.argv[2] || 8888,
  mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "wasm": "application/wasm",
    "css": "text/css",
  };

http.createServer({}, function (request, response) {
  var uri = url.parse(request.url).pathname,
    filename = path.join(process.cwd(), uri);

  fs.exists(filename, function (exists) {
    if (!exists) {
      console.log("File doesn't exist:" + filename);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += "/index.html";
    }

    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        response.writeHead(500, {
          "Content-Type": "text/plain",
          "Cross-Origin-Opener-Policy": "same-origin unsafe-allow-outgoing",
        });
        response.write(err + "\n");
        response.end();
        return;
      }

      var mimeType = mimeTypes[filename.split(".").pop()];

      if (!mimeType) {
        mimeType = "text/plain";
      }

      console.log("serving " + filename);

      response.writeHead(200, {
        "Content-Type": mimeType,
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Request-Private-Network": "true",
        "Access-Control-Allow-Private-Network": "true",
        "Access-Control-Allow-Headers":
          "Access-Control-Request-Private-Network",
        "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
      });
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10), "localhost");

console.log(
  "Static file server running at\n  => http://localhost:" + port +
    "/index.html\nCTRL + C to shutdown",
);
/*
fetch('http://localhost:8888/test.txt', {headers: {'Access-Control-Request-Private-Network': 'true'}})
.then((r) => r.text())
.then((t) => console.log(t))
.catch(console.error);
*/
