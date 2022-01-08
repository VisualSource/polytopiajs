export default class Settings {
    public confirm_turn = false;
    public sound_effects = true;
    public ambience = true;
    public tribe_music = true;
    public suggestions = true;
    public info_on_build = true;
    public volume: number = 50;
    constructor(){}
    public load(): void {}
}