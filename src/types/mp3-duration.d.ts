declare module 'mp3-duration' {
    function mp3Duration(buffer: Buffer | string): Promise<number>;
    export default mp3Duration;
}
