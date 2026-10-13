import { bootstrap } from './bootstrap';

/**
 * Serverless entrypoint (Vercel `api` service): the platform imports the default export and
 * routes `/api/*` requests to it. Local and self-hosted runs use `main.ts`, which listens on a port.
 */
const { app } = bootstrap();

export default app;
