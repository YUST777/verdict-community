"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webmState = void 0;
const traversal_1 = require("../../containers/webm/traversal");
const lazy_cues_fetch_1 = require("./lazy-cues-fetch");
const webmState = ({ controller, logLevel, readerInterface, src, prefetchCache, }) => {
    const trackEntries = {};
    const onTrackEntrySegment = (trackEntry) => {
        var _a;
        const trackId = (0, traversal_1.getTrackId)(trackEntry);
        if (!trackId) {
            throw new Error('Expected track id');
        }
        if (trackEntries[trackId]) {
            return;
        }
        const codec = (0, traversal_1.getTrackCodec)(trackEntry);
        if (!codec) {
            throw new Error('Expected codec');
        }
        const trackTimescale = (0, traversal_1.getTrackTimestampScale)(trackEntry);
        trackEntries[trackId] = {
            codec: codec.value,
            trackTimescale: (_a = trackTimescale === null || trackTimescale === void 0 ? void 0 : trackTimescale.value) !== null && _a !== void 0 ? _a : null,
        };
    };
    let timestampMap = new Map();
    const getTimestampOffsetForByteOffset = (byteOffset) => {
        const entries = Array.from(timestampMap.entries());
        const sortedByByteOffset = entries
            .sort((a, b) => {
            return a[0] - b[0];
        })
            .reverse();
        for (const [offset, timestamp] of sortedByByteOffset) {
            if (offset >= byteOffset) {
                continue;
            }
            return timestamp;
        }
        return timestampMap.get(byteOffset);
    };
    const setTimestampOffset = (byteOffset, timestamp) => {
        timestampMap.set(byteOffset, timestamp);
    };
    let timescale = null;
    const setTimescale = (newTimescale) => {
        timescale = newTimescale;
    };
    const getTimescale = () => {
        // https://www.matroska.org/technical/notes.html
        // When using the default value of TimestampScale of “1,000,000”, one Segment Tick represents one millisecond.
        if (timescale === null) {
            return 1000000;
        }
        return timescale;
    };
    const segments = [];
    const clusters = [];
    const avcProfilesMap = {};
    const setAvcProfileForTrackNumber = (trackNumber, avcProfile) => {
        avcProfilesMap[trackNumber] = avcProfile;
    };
    const getAvcProfileForTrackNumber = (trackNumber) => {
        var _a;
        return (_a = avcProfilesMap[trackNumber]) !== null && _a !== void 0 ? _a : null;
    };
    const cues = (0, lazy_cues_fetch_1.lazyCuesFetch)({
        controller,
        logLevel,
        readerInterface,
        src,
        prefetchCache,
    });
    const getTimeStampMapForSeekingHints = () => {
        return timestampMap;
    };
    const setTimeStampMapForSeekingHints = (newTimestampMap) => {
        timestampMap = newTimestampMap;
    };
    return {
        cues,
        onTrackEntrySegment,
        getTrackInfoByNumber: (id) => trackEntries[id],
        setTimestampOffset,
        getTimestampOffsetForByteOffset,
        getTimeStampMapForSeekingHints,
        setTimeStampMapForSeekingHints,
        getTimescale,
        setTimescale,
        addSegment: (seg) => {
            const segment = {
                ...seg,
                index: segments.length,
            };
            segments.push(segment);
        },
        addCluster: (cluster) => {
            const exists = clusters.some((existingCluster) => existingCluster.start === cluster.start);
            if (!exists) {
                clusters.push(cluster);
            }
        },
        getFirstCluster: () => {
            return clusters.find((cluster) => cluster.segment === 0);
        },
        isInsideSegment: (iterator) => {
            var _a;
            const offset = iterator.counter.getOffset();
            const insideClusters = segments.filter((cluster) => {
                return (offset >= cluster.start && offset <= cluster.start + cluster.size);
            });
            if (insideClusters.length > 1) {
                throw new Error('Expected to only be inside 1 cluster');
            }
            return (_a = insideClusters[0]) !== null && _a !== void 0 ? _a : null;
        },
        isInsideCluster: (offset) => {
            for (const cluster of clusters) {
                if (offset >= cluster.start && offset < cluster.start + cluster.size) {
                    return cluster;
                }
            }
            return null;
        },
        setAvcProfileForTrackNumber,
        getAvcProfileForTrackNumber,
    };
};
exports.webmState = webmState;
