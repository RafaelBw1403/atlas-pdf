import express from "express";
import cors from 'cors';
import { routes } from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";
import { notFound } from "./middleware/notFound.js";

export function createApp() {

    const app = express();

    // app.use(cors());
    
    app.use(express.json({ limit: "5mb" }));


    app.get("/health", (_req, res) => {
        console.log("✅ Health check route hit");
        res.json({ ok: true });
    });
    app.use(`/api`, routes);

    app.use("/assets", express.static("public"));
    app.use("/", express.static("public"));

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
