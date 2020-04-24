import globalDispatcher from './EventDispatcher';
interface InitParams{
    players: Polytopia.IPlayerObject[]
}
export default class GameState{
    static players: Polytopia.IPlayerObject[]
    static activePlayer = 0;
    static difficulty: Polytopia.IDifficulty = "Normal";
    static turns: number = 0;
    static worldsize: number = 11;
    static mode: Polytopia.IGameMode = "domination";
    public init({players}:InitParams){
        GameState.players = players;
    }
    public nextActivePlayer(){
        if(GameState.activePlayer === (GameState.players.length-1)){
            GameState.activePlayer = 0;
        }else{
            GameState.activePlayer++;
        }
    }
    public get currentPlayer(): Polytopia.IPlayerObject{
        return GameState.players[GameState.activePlayer];
    }
}