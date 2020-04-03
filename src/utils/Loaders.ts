
class LocalStorageLoader{
    protected read(key: string){
        const item = localStorage.getItem(key);
        if(item) return JSON.parse(item);
        return new Error("Undefined key.")
    }
    protected write(key: string, value: any){
        localStorage.setItem(key, JSON.stringify(value));
    }
    protected delete(key: string){
        localStorage.removeItem(key);
    }
    protected deleteAll(){ localStorage.clear();}
}

export class SettingsLoader extends LocalStorageLoader{
    static settings = {};
    static onInit(){}
    private default = {
       sound_effects: true,
       ambience: true,
       tribe_music: true,
       suggestions: true,
       info_on_build: true,
       confirm_turn:  true,
       volume: 100,
       lang: "en_US",
    };

}