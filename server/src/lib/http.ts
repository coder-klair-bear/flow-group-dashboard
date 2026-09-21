import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

/** Wraps an async handler so a rejected promise reaches the error middleware. */
export function asyncRoute(
  fn: (req: Request, res: Response) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Invalid query parameters",
      detail: err.issues.map((i) => `${i.path.join(".") || "query"}: ${i.message}`).join("; "),
    });
    return;
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(err);
  res.status(500).json({ error: "Server error", detail: message });
}
