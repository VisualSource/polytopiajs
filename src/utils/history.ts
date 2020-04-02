import { createBrowserHistory } from "history";
const history = createBrowserHistory();
export default history;

interface RouteOptions{
    pathname: string;
    search?: string;
}
export function route(to: string | RouteOptions){
    history.push(to as any);
}