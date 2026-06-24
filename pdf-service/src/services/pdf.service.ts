import { spawn } from "child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config/index.js";

export async function generatePdf(html: string): Promise<Buffer> {
    const tmpFile = join(tmpdir(), `weasy-${randomUUID()}.html`);
    writeFileSync(tmpFile, html, 'utf-8');
    const args = [tmpFile, '-'];
    return spawnWeasyPrint(args, tmpFile);
}

function spawnWeasyPrint(args: string[], tmpFile: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const proc = spawn(config.weasyPrintPath, args, {
            timeout: config.weasyPrintTimeout,
        });

        const chunks: Buffer[] = [];
        const errorChunks: Buffer[] = [];

        proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
        proc.stderr.on('data', (chunk: Buffer) => errorChunks.push(chunk));

        proc.on('error', (err) => {
            try { unlinkSync(tmpFile); } catch {}
            reject(err);
        });

        proc.on('close', (code) => {
            try { unlinkSync(tmpFile); } catch {}
            if (code === 0) {
                resolve(Buffer.concat(chunks));
            } else {
                const stderr = Buffer.concat(errorChunks).toString();
                reject(new Error(stderr || `weasyprint exited with code ${code}`));
            }
        });
    });
}
