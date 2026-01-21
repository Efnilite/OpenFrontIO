import { LobbySettings } from "../Schemas";
import { Difficulty, GameMapType, GameMode } from "./Game";

export const DEFAULT_LOBBY_SETTINGS: LobbySettings = {
  selectedMap: GameMapType.World,
  selectedDifficulty: Difficulty.Easy,
  disableNations: false,
  gameMode: GameMode.FFA,
  teamCount: 2,
  bots: 400,
  spawnImmunity: false,
  spawnImmunityDurationMinutes: undefined,
  infiniteGold: false,
  donateGold: false,
  infiniteTroops: false,
  donateTroops: false,
  maxTimer: false,
  maxTimerValue: undefined,
  instantBuild: false,
  randomSpawn: false,
  compactMap: false,
  goldMultiplier: false,
  goldMultiplierValue: undefined,
  startingGold: false,
  startingGoldValue: undefined,
  useRandomMap: false,
  disabledUnits: [],
  nationCount: 0,
};
