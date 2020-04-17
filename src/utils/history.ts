import { createBrowserHistory } from "history";
import { useLocation } from "react-router-dom";
const history = createBrowserHistory();
export default history;
export function useQuery(): Polytopia.QueryParams {
    return queryFromURI(useLocation().search) as Polytopia.QueryParams;
}
/**
 * Non hook version of useQuery()
 *
 * @export
 * @returns {Polytopia.QueryParams}
 */
export function getQuery(): Polytopia.QueryParams{
    return queryFromURI(window.location.search) as Polytopia.QueryParams;
}
/**
@author swipely
@see https://github.com/swipely/aviator/blob/master/src/request.js
**/
function queryFromURI(input: string): any{
    const queryParams: {[item: string]: any} = {};
    const _apply = (key: string, val: any) =>{
        if(key.indexOf('[]') !== -1){
            key = key.replace("[]",'');
            if(Array.isArray(queryParams[key])){
                queryParams[key].push(val);
            }else{
                queryParams[key] = [val];
            }
        }else{
            queryParams[key] = val;
        }
    }
    let parts;
    if(!input) return;
    parts = input.replace('?','').split('&');

    parts.forEach(part=>{
        let key = decodeURIComponent(part.split('=')[0]),
        val = decodeURIComponent(part.split('=')[1]);

        if(part.indexOf('=') === -1) return;
        _apply(key,val);
    });

    
return queryParams;

}








interface RouteOptions{
    query?: {[item: string]: any};
    replace?: boolean
}
export function route(to: string, options?: RouteOptions){
    if(options?.replace) history.replace({pathname: to, search: serializeQueryParams(options?.query)}); 
    else history.push({pathname: to, search: serializeQueryParams(options?.query)});
}
  /**
    @author swipely
    @method serializeQueryParams
    @param {Object} queryParams
    @return {String} queryString "?foo=bar&baz[]=boo&baz=[]oob"
    @see https://github.com/swipely/aviator/blob/master/src/navigator.js
  **/
function serializeQueryParams(queryParams: any){
    let queryString: string[] = [], val;
    for(let key in queryParams){
        if(queryParams.hasOwnProperty(key)){
            val = queryParams[key];
            if(Array.isArray(val)){
                val.forEach(item=>{
                    queryString.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
                });
            }else{
                queryString.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
            }
        }
    }
    return '?' + queryString.join('&');
}

