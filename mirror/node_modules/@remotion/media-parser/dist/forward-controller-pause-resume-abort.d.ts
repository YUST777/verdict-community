import type { MediaParserController } from './controller/media-parser-controller';
export declare const forwardMediaParserControllerPauseResume: ({ parentController, childController, }: {
    parentController: MediaParserController;
    childController: MediaParserController;
}) => {
    cleanup: () => void;
};
