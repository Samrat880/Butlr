import { briefRouter } from "~/server/api/routers/brief";
import { billingRouter } from "~/server/api/routers/billing";
import { chatRouter } from "~/server/api/routers/chat";
import { integrationsRouter } from "~/server/api/routers/integrations";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  brief: briefRouter,
  billing: billingRouter,
  chat: chatRouter,
  integrations: integrationsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
