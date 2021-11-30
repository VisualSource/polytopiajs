/**
 * @see https://www.html5rocks.com/en/tutorials/webaudio/intro/
 *
 * @export
 * @class AudioLoader
 */
export default class AudioLoader {
    static context: AudioContext = AudioLoader.getContext();
    static getContext(){
        try {
            const context = window.AudioContext || window.webkitAudioContext;
            return new context();   
        } catch (error) {
            throw error;
        }
    }
    static async decodeAudio(raw: ArrayBuffer): Promise<AudioBuffer> {
        return new Promise((ok,err)=>{
            AudioLoader.context.decodeAudioData(raw,(buffer)=>{
                ok(buffer);
            },(error)=>{
                err(error);
            });
        });
    }
    static playSound(buffer: AudioBuffer){
        const ctx = AudioLoader.context;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    }
}

