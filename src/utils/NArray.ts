/**
 * This class is mostly used in the world generation and world data,
 * it keeps me (Visualsource) from mixing up whats a row and whats a column
 * it also has a cool custom iterator which makes things cool and easy to work with.
 *
 * @export
 * @class NArray
 * @template T
 */
export default class NArray<T> {
    /*
    *   1  2
    *  [ ][ ] 
    *   1 => ROW
    *   2 => COL
    */
    private _data: T[][] = []; 
    constructor(private size: number){
        for(let i = 0; i < this.size; i++) this._data.push([]);
    }
    public set(row: number, col: number, data: T): void {
        this._data[row][col] = data;
    }
    public get(row: number, col: number){
        return this._data[row][col];
    }
    public isValid(row: number, col: number): T | undefined {
        if(!this._data[row]) return;
        return this._data[row][col]
    }
    private *[Symbol.iterator](){
        for(const row of this._data){
            for(const col of row){
                yield col;
            }
        }
    }
}


