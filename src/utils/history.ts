import { createBrowserHistory } from "history";
import { useLocation } from "react-router-dom";
const history = createBrowserHistory();
export default history;
export function useQuery(): Polytopia.QueryParams {
    const params: {[key: string]: string} = {}
    new URLSearchParams(useLocation().search).forEach((value: string,key: string)=>{
        params[key] = value;
    });
    return params as Polytopia.QueryParams;
}
/**
 * Non hook version of useQuery()
 *
 * @export
 * @returns {Polytopia.QueryParams}
 */
export function getQuery(): Polytopia.QueryParams{
    const params: {[key: string]: string} = {}
    new URLSearchParams(window.location.search).forEach((value: string,key: string)=>{
        params[key] = value;
    });
    return params as Polytopia.QueryParams;
}

interface RouteOptions{
    query?: {[item: string]: any};
    state? : { [item: string]: any }
}
export function route(to: string, options?: RouteOptions){
    history.push({pathname: to, search: serializeQueryParams(options?.query), state:options?.state});
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

