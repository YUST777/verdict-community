/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AacAudioSpecificConfig } from '../codec.js';
import { Bitstream } from '../misc.js';
export type AdtsHeaderTemplate = {
    header: Uint8Array;
    bitstream: Bitstream;
};
export declare const buildAdtsHeaderTemplate: (config: AacAudioSpecificConfig) => AdtsHeaderTemplate;
export declare const writeAdtsFrameLength: (bitstream: Bitstream, frameLength: number) => void;
//# sourceMappingURL=adts-misc.d.ts.map