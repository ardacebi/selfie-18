import express from "express";
import cors from "cors";
import path from "path";
import { promises as fs } from "fs";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./config/db.js";
import AccountHandling from "./routes/AccountHandling.route.js";
import NotesHandling from "./routes/NotesHandling.route.js";
import EventHandling from "./routes/EventsHandling.route.js";
import ActivityHandling from "./routes/ActivityHandling.route.js";
import { config } from "dotenv";

config();

const port = process.env.NODE_PORT || 8000;

const app = express();

const vite = await createViteServer({
  server: {
    middlewareMode: true,
  },
  appType: "custom",
});

app.use(vite.middlewares);
app.use(cors());
app.use(express.json());
app.use("/api/account", AccountHandling);
app.use("/api/notes", NotesHandling);
app.use("/api/events", EventHandling);
app.use("/api/activities", ActivityHandling);

app.use("*", async (req, res, next) => {
  try {
    const url = req.originalUrl || "/";
    const accept = req.headers.accept || "";
    const isApi = url.startsWith("/api/");
    const hasExt = !!path.extname(url);
    const isHtmlNav = accept.includes("text/html");

    if (isApi || hasExt || !isHtmlNav) return next();

    const template = await vite.transformIndexHtml(
      url,
      await fs.readFile(path.resolve("index.html"), "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("/src/app-entry-server.jsx");
    const renderedContent = render(url);
    const html = template.replace(`not rendered body`, renderedContent);

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    console.error(e);
    res.status(500).end(e.message);
  }
});

app.listen(port, () => {
  connectDB();
  console.log(`http://localhost:${port}`);
});
