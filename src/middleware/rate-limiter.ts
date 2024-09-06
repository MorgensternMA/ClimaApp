import { Context, Next } from "@oakserver/oak";
import { Redis } from "../services/redis";

export async function rateLimiter(context: Context, next: Next): Promise<void> {
  let apiKey = context.request.headers.get("API-KEY");
  if (!apiKey) {
    apiKey = context.request.headers.get("x-forwarded-for") || context.request.ip;
  }

  const attemps = await Redis.increment(apiKey);
  if (attemps > 2) {
    context.response.status = 429;
    context.response.body = JSON.stringify({ error: "too many requests!" });
    return;
  }

  await next();
}
