import { Context, Next } from "@oakserver/oak";
import prisma from "../services/prisma";
import { Redis } from "../services/redis";

export async function logging(context: Context, next: Next): Promise<void> {
    const apiKey = context.request.headers.get("API-KEY");
    const ip = context.request.headers.get("x-forwarded-for") || context.request.ip;
    let cachedApiKey;

    if (apiKey) {
        cachedApiKey = await Redis.get(apiKey);

        if (!cachedApiKey) {
            const apiKeyRecord = await prisma.api_key.findUnique({
                where: {
                    key: apiKey,
                },
            });
            cachedApiKey = apiKeyRecord?.id;
            await Redis.set(apiKey, apiKeyRecord?.id);
        }
    }

    try {
        await prisma.log.create({
            data: {
                endpoint: context.request.url.pathname,
                ip_address: ip,
                headers: Object.fromEntries(context.request.headers),
                query_params: Object.fromEntries(context.request.url.searchParams),
                api_key_id: parseInt(cachedApiKey, 10),
            },
        });
        context.state.api_key_id = cachedApiKey;
    } catch (_) {
        await prisma.log.create({
            data: {
                endpoint: context.request.url.pathname,
                ip_address: ip,
                headers: Object.fromEntries(context.request.headers),
                query_params: Object.fromEntries(context.request.url.searchParams),
            },
        });
    }
    await next();
}
