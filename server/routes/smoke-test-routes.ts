import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  const results: Record<string, { pass: boolean; latencyMs: number; error?: string }> = {};
  const startAll = Date.now();

  const runCheck = async (name: string, fn: () => Promise<void>) => {
    const start = Date.now();
    try {
      await fn();
      results[name] = { pass: true, latencyMs: Date.now() - start };
    } catch (e: any) {
      results[name] = { pass: false, latencyMs: Date.now() - start, error: e.message };
    }
  };

  await runCheck("database", async () => {
    const r = await pool.query("SELECT COUNT(*) FROM users");
    if (!r.rows) throw new Error("No response from database");
  });

  await runCheck("auth_endpoint", async () => {
    const r = await fetch(`http://localhost:${process.env.PORT || 5000}/api/auth/session`, {
      headers: { "Cookie": "" },
    });
    if (r.status !== 200 && r.status !== 401) throw new Error(`Status: ${r.status}`);
  });

  await runCheck("brands_api", async () => {
    const r = await fetch(`http://localhost:${process.env.PORT || 5000}/api/brands`, {
      headers: { "Cookie": req.headers.cookie || "" },
    });
    if (!r.ok && r.status !== 401) throw new Error(`Status: ${r.status}`);
  });

  await runCheck("health_api", async () => {
    const r = await fetch(`http://localhost:${process.env.PORT || 5000}/api/health`);
    const data = await r.json();
    if (data.status === "unhealthy") throw new Error("Health check reports unhealthy");
  });

  await runCheck("monitoring_kpis", async () => {
    const r = await fetch(`http://localhost:${process.env.PORT || 5000}/api/monitoring-dashboard/kpis`, {
      headers: { "Cookie": req.headers.cookie || "" },
    });
    if (!r.ok && r.status !== 401) throw new Error(`Status: ${r.status}`);
  });

  await runCheck("object_storage_config", async () => {
    if (!process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) throw new Error("Object storage bucket not configured");
    if (!process.env.PRIVATE_OBJECT_DIR) throw new Error("Private object dir not set");
  });

  const passed = Object.values(results).filter(r => r.pass).length;
  const total = Object.keys(results).length;

  res.json({
    summary: `${passed}/${total} checks passed`,
    totalLatencyMs: Date.now() - startAll,
    allPassed: passed === total,
    results,
  });
});

export default router;
