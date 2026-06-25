import { Injectable } from "@nestjs/common";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface PingResult {
  ok: boolean;
  latencyMs: number | null;
  errorMessage: string | null;
}

@Injectable()
export class PingService {
  async ping(host: string, timeoutMs: number): Promise<PingResult> {
    const trimmed = host.trim();
    if (!trimmed) {
      return { ok: false, latencyMs: null, errorMessage: "empty host" };
    }

    try {
      const isWin = process.platform === "win32";
      const waitSec = Math.max(1, Math.ceil(timeoutMs / 1000));
      const args = isWin
        ? ["-n", "1", "-w", String(timeoutMs), trimmed]
        : ["-c", "1", "-W", String(waitSec), trimmed];

      const { stdout } = await execFileAsync("ping", args, {
        timeout: timeoutMs + 2_000,
      });

      const match = stdout.match(/time[=<](\d+(?:\.\d+)?)/i);
      return {
        ok: true,
        latencyMs: match ? Math.round(Number.parseFloat(match[1])) : null,
        errorMessage: null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "ping failed";
      return { ok: false, latencyMs: null, errorMessage: message };
    }
  }

  /** Dev/demo when `devProbeHost` is unset — deterministic rolling result */
  simulate(equipmentSlug: string, intervalMs: number): PingResult {
    const window = Math.floor(Date.now() / intervalMs);
    const hash = [...equipmentSlug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const roll = (hash + window) % 12;
    const ok = roll !== 0 && roll !== 7;
    return {
      ok,
      latencyMs: ok ? 12 + (roll % 35) : null,
      errorMessage: ok ? null : "simulated unreachable",
    };
  }
}
