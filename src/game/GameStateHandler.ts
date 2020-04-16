import globalDispatcher from './EventDispatcher';
interface InitParams{
    players: Polytopia.IPlayerObject[]
}
export default class GameState{
    static players: Polytopia.IPlayerObject[]
    static activePlayer = 0;
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