
/**
 * @see https://www.geeksforgeeks.org/multidimensional-array-in-javascript/
 *
 *   1  2
 *  [ ][ ] 
 *   1 => ROW
 *   2 => COL
 * 
 * 
 * @export
 * @class NArray
 * @template T
 */
export default class NArray<T> {
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


