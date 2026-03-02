import type { ApiRoutes } from '@remotion/studio-shared';
export declare const callApi: <Endpoint extends keyof ApiRoutes>(endpoint: Endpoint, body: ApiRoutes[Endpoint]["Request"], signal?: AbortSignal | undefined) => Promise<ApiRoutes[Endpoint]["Response"]>;
