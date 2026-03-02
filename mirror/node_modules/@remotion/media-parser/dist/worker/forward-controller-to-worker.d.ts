import type { MediaParserController } from '../controller/media-parser-controller';
import type { WorkerRequestPayload } from './worker-types';
export declare const forwardMediaParserControllerToWorker: (controller: MediaParserController) => ((message: WorkerRequestPayload) => void);
