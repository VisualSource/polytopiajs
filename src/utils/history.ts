import { createBrowserHistory } from "history";
import { useLocation } from "react-router-dom";
const history = createBrowserHistory();
export default history;

interface RouteOptions{
    pathname: string;
    search?: string;
}
export function route(to: string | RouteOptions){
    history.push(to as any);
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}