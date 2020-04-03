import React, { useContext } from "react";
import GameStateHandler from '../../game/GameStateHandler';

const PolytopiaGameContext = React.createContext({});
export const useGame = () => useContext(PolytopiaGameContext);
export const GameProvider = ({
    children,
  }: {children: any}) => {
   
    return (
      <PolytopiaGameContext.Provider value={{}}>
        {children}
      </PolytopiaGameContext.Provider>
    );
  };