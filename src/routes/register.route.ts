import { Context } from "@oakserver/oak";
import { nanoid } from "nanoid";
import prisma from "../services/prisma";

export async function postRegister(ctx: Context) {
  try {
    const apiKey = nanoid();

    const newApiKey = await prisma.api_key.create({
      data: {
        key: apiKey
      }
    });
    ctx.response.status = 201;
    ctx.response.body = {
      message: "API successfully created.",
      apiKey: newApiKey.key,
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error ? error.message : "Unknown error processing the request.",
    };
  }
}
