export enum SystemEvents {
    LOG = "LOG",
    ERROR = "ERROR",
    ASSET_LOADER = "ASSET_LOADER",
    OBJECT = "OBJECT",
    INTERACTION = "INTERACTION",
    UNIT = "UNIT",
    SOUND = "SOUND",
    ACTION = "ACTION"
};

export enum SoundEvent {
    PLAY,
    STOP,
    PAUSE
}

export enum UnitEvent {
    MOVE,
    ATTACK,
    GENERATE,
    HIDE_SELECTOR
}

export enum ObjectEvents {
    DESELECTION,
    SELECTION,
    RESET,
    UNIT_SELECT,
    TILE_SELECT
}

export enum AssetLoaderEvents {
    ASSETS_LOADED,
    ASSETS_INSTALLED,
    ASSETS_INSTALL_ERROR,
    ASSETS_LOAD_ERROR,
    ASSETS_UPDATED,
    ASSETS_START_UNINSTALL,
    ASSETS_START_INSTALL,
    CHECKING_FOR_UPDATE,
    ASSETS_INIT_START,
    ASSETS_INIT_END
}

export enum ActionEvent {
    RECOVER, // heal self unit.
    HEAL, // heal other unit
    SPAWN, // create unit
    CREATE, // create building
    DISBAND, // destory unit
    DESTORY, // destory building,
    GATHER
}