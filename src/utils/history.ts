import { createBrowserHistory } from "history";
import { useLocation } from "react-router-dom";
const history = createBrowserHistory();
export default history;

interface RouteOptions{
    search?: {[item: string]: any};
    state? : { [item: string]: any }
}
export function route(to: string, options?: RouteOptions){
    const url = new URL(to,"/");
  /*  if(options && options.search){
        Object.keys(options.search).forEach(value=>{
            if(options.search){
                url.searchParams.append(value,options.search[value])
            }
        })
    }*/
    history.push(url.toString());
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}