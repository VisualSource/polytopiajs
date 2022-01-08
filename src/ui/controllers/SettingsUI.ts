import { writable, type Unsubscriber } from 'svelte/store';
import Game from '../../game/core/Game';
export default class SettingsUI {
    public confirm_turn = writable<boolean>(true);
    public sound_effects = writable<boolean>(true);
    public ambience = writable<boolean>(true);
    public tribe_music = writable<boolean>(true);
    public suggestions = writable<boolean>(true);
    public info_on_build = writable<boolean>(true);
    public volume = writable<number>(50);
    private game = new Game();
    constructor(){
        const {confirm_turn,sound_effects,ambience,tribe_music,suggestions,info_on_build,volume} = this.game.settings;
        this.confirm_turn.set(confirm_turn);
        this.sound_effects.set(sound_effects);
        this.info_on_build.set(info_on_build);
        this.ambience.set(ambience);
        this.tribe_music.set(tribe_music);
        this.suggestions.set(suggestions);
        this.volume.set(volume);
        this.confirm_turn.subscribe(value=>{this.game.settings.confirm_turn = value;});
        this.sound_effects.subscribe(value=>{this.game.settings.sound_effects=value;});
        this.info_on_build.subscribe(value=>{this.game.settings.info_on_build=value;});
        this.ambience.subscribe(value=>{this.game.settings.ambience=value});
        this.tribe_music.subscribe(value=>{this.game.settings.tribe_music=value;});
        this.suggestions.subscribe(value=>{this.game.settings.suggestions=value;});
        this.volume.subscribe(value=>{this.game.settings.volume=value;});

    }
}   