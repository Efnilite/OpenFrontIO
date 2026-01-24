import { TemplateResult, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { translateText } from "../client/Utils";
import { getServerConfigFromClient } from "../core/configuration/ConfigLoader";
import {
  Difficulty,
  GameMapSize,
  GameMapType,
  GameMode,
  HumansVsNations,
  UnitType,
  mapCategories,
} from "../core/game/Game";
import {
  ClientInfo,
  GameConfig,
  GameInfo,
  TeamCountConfig,
  isValidGameID,
} from "../core/Schemas";
import { generateID } from "../core/Util";
import "./components/baseComponents/Modal";
import { BaseModal } from "./components/BaseModal";
import "./components/CopyButton";
import "./components/Difficulties";
import "./components/FluentSlider";
import "./components/lobby/LobbyGameMode";
import "./components/lobby/LobbyGameOptions";
import "./components/lobby/LobbyNationDifficulty";
import "./components/lobby/LobbyPlayerView";
import "./components/Maps";
import { modalHeader } from "./components/ui/ModalHeader";
import { crazyGamesSDK } from "./CrazyGamesSDK";
import { JoinLobbyEvent } from "./Main";
import { terrainMapFileLoader } from "./TerrainMapFileLoader";
import { renderUnitTypeOptions } from "./utilities/RenderUnitTypeOptions";
import randomMap from "/images/RandomMap.webp?url";
@customElement("host-lobby-modal")
export class HostLobbyModal extends BaseModal {
  @state() private selectedMap: GameMapType = GameMapType.World;
  @state() private selectedDifficulty: Difficulty = Difficulty.Easy;
  @state() private disableNations = false;
  @state() private gameMode: GameMode = GameMode.FFA;
  @state() private teamCount: TeamCountConfig = 2;

  constructor() {
    super();
    this.id = "page-host-lobby";
  }
  @state() private bots: number = 400;
  @state() private spawnImmunity: boolean = false;
  @state() private spawnImmunityDurationMinutes: number | undefined = undefined;
  @state() private infiniteGold: boolean = false;
  @state() private donateGold: boolean = false;
  @state() private infiniteTroops: boolean = false;
  @state() private donateTroops: boolean = false;
  @state() private maxTimer: boolean = false;
  @state() private maxTimerValue: number | undefined = undefined;
  @state() private instantBuild: boolean = false;
  @state() private randomSpawn: boolean = false;
  @state() private compactMap: boolean = false;
  @state() private goldMultiplier: boolean = false;
  @state() private goldMultiplierValue: number | undefined = undefined;
  @state() private startingGold: boolean = false;
  @state() private startingGoldValue: number | undefined = undefined;
  @state() private lobbyId = "";
  @state() private lobbyUrlSuffix = "";
  @state() private clients: ClientInfo[] = [];
  @state() private useRandomMap: boolean = false;
  @state() private disabledUnits: UnitType[] = [];
  @state() private lobbyCreatorClientID: string = "";
  @state() private nationCount: number = 0;

  private playersInterval: NodeJS.Timeout | null = null;
  // Add a new timer for debouncing bot changes
  private botsUpdateTimer: number | null = null;
  private mapLoader = terrainMapFileLoader;

  private leaveLobbyOnClose = true;

  private renderOptionToggle(
    labelKey: string,
    checked: boolean,
    onChange: (val: boolean) => void,
    hidden: boolean = false,
  ): TemplateResult {
    if (hidden) return html``;

    return html`
      <button
        class="relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 h-full min-h-[100px] w-full cursor-pointer ${checked
          ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 opacity-80"}"
        @click=${() => onChange(!checked)}
      >
        <div
          class="text-xs uppercase font-bold tracking-wider text-center w-full leading-tight break-words hyphens-auto ${checked
            ? "text-white"
            : "text-white/60"}"
        >
          ${translateText(labelKey)}
        </div>
      </button>
    `;
  }

  private getRandomString(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(
      { length: 5 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  }

  private async buildLobbyUrl(): Promise<string> {
    const config = await getServerConfigFromClient();
    return `${window.location.origin}/${config.workerPath(this.lobbyId)}/game/${this.lobbyId}?lobby&s=${encodeURIComponent(this.lobbyUrlSuffix)}`;
  }

  private async constructUrl(): Promise<string> {
    this.lobbyUrlSuffix = this.getRandomString();
    return await this.buildLobbyUrl();
  }

  private updateHistory(url: string): void {
    history.replaceState(null, "", url);
  }

  render() {
    const content = html`
      <div
        class="h-full flex flex-col bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden select-none"
      >
        <!-- Header -->
        ${modalHeader({
          title: translateText("host_modal.title"),
          onBack: () => {
            this.leaveLobbyOnClose = true;
            this.close();
          },
          ariaLabel: translateText("common.back"),
          rightContent: html`
            <copy-button
              .lobbyId=${this.lobbyId}
              .lobbySuffix=${this.lobbyUrlSuffix}
              include-lobby-query
            ></copy-button>
          `,
        })}

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 mr-1">
          <div class="max-w-5xl mx-auto space-y-10">
            <!-- Map Selection -->
            <div class="space-y-6">
              <div
                class="flex items-center gap-4 pb-2 border-b border-white/10"
              >
                <div
                  class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"
                    />
                  </svg>
                </div>
                <h3
                  class="text-lg font-bold text-white uppercase tracking-wider"
                >
                  ${translateText("map.map")}
                </h3>
              </div>
              <div class="space-y-8">
                <!-- Use the imported mapCategories -->
                ${Object.entries(mapCategories).map(
                  ([categoryKey, maps]) => html`
                    <div class="w-full">
                      <h4
                        class="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 pl-2"
                      >
                        ${translateText(`map_categories.${categoryKey}`)}
                      </h4>
                      <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      >
                        ${maps.map((mapValue) => {
                          const mapKey = Object.entries(GameMapType).find(
                            ([, v]) => v === mapValue,
                          )?.[0];
                          return html`
                            <div
                              @click=${() => this.handleMapSelection(mapValue)}
                              class="cursor-pointer transition-transform duration-200 active:scale-95"
                            >
                              <map-display
                                .mapKey=${mapKey}
                                .selected=${!this.useRandomMap &&
                                this.selectedMap === mapValue}
                                .translation=${translateText(
                                  `map.${mapKey?.toLowerCase()}`,
                                )}
                              ></map-display>
                            </div>
                          `;
                        })}
                      </div>
                    </div>
                  `,
                )}
                <!-- Random Map Card -->
                <div class="w-full pt-4 border-t border-white/5">
                  <h4
                    class="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 pl-2"
                  >
                    ${translateText("map_categories.special")}
                  </h4>
                  <div
                    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    <button
                      class="relative group rounded-xl border transition-all duration-200 overflow-hidden flex flex-col items-stretch ${
                        this.useRandomMap
                          ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }"
                      @click=${this.handleSelectRandomMap}
                    >
                      <div
                        class="aspect-[2/1] w-full relative overflow-hidden bg-black/20"
                      >
                        <img
                          src=${randomMap}
                          alt=${translateText("map.random")}
                          class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div class="p-3 text-center border-t border-white/5">
                        <div
                          class="text-xs font-bold text-white uppercase tracking-wider break-words hyphens-auto"
                        >
                          ${translateText("map.random")}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Difficulty Selection -->
            <lobby-nation-difficulty
                .selected=${this.selectedDifficulty}
                .disabled=${this.disableNations}
                .onSelect=${(d: Difficulty) => this.handleDifficultySelection(d)}
            ></lobby-nation-difficulty>

            <!-- Game Mode -->
            <lobby-game-mode
                .selectedGameMode=${this.gameMode}
                .selectedTeamConfig=${this.teamCount}
                .onSelectGameMode=${(g: GameMode) => this.handleGameModeSelection(g)}
                .onSelectTeamConfig=${(c: TeamCountConfig) => this.handleTeamCountSelection(c)}
            ></lobby-game-mode>

            <!-- Game Options -->
            <lobby-game-options
              .bots=${this.bots}
              .onBotsChange=${(e: Event) => this.handleBotsChange(e)}
              .spawnImmunity=${this.spawnImmunity}
              .spawnImmunityDurationMinutes=${this.spawnImmunityDurationMinutes}
              .onSpawnImmunityDurationInput=${(e: Event) => this.handleSpawnImmunityDurationInput(e)}
              .onSpawnImmunityDurationKeyDown=${(e: KeyboardEvent) => this.handleSpawnImmunityDurationKeyDown(e)}
              .infiniteGold=${this.infiniteGold}
              .onInfiniteGoldChange=${this.handleInfiniteGoldChange}
              .donateGold=${this.donateGold}
              .onDonateGoldChange=${this.handleDonateGoldChange}
              .infiniteTroops=${this.infiniteTroops}
              .onInfiniteTroopsChange=${this.handleInfiniteTroopsChange}
              .donateTroops=${this.donateTroops}
              .onDonateTroopsChange=${this.handleDonateTroopsChange}
              .maxTimer=${this.maxTimer}
              .maxTimerValue=${this.maxTimerValue}
              .onMaxTimerValueInput=${(e: Event) => this.handleMaxTimerValueChanges(e)}
              .onMaxTimerValueKeyDown=${(e: KeyboardEvent) => this.handleMaxTimerValueKeyDown(e)}
              .instantBuild=${this.instantBuild}
              .onInstantBuildChange=${this.handleInstantBuildChange}
              .randomSpawn=${this.randomSpawn}
              .onRandomSpawnChange=${this.handleRandomSpawnChange}
              .compactMap=${this.compactMap}
              .onCompactMapChange=${this.handleCompactMapChange}
              .goldMultiplier=${this.goldMultiplier}
              .goldMultiplierValue=${this.goldMultiplierValue}
              .onGoldMultiplierValueInput=${(e: Event) => this.handleGoldMultiplierValueChanges(e)}
              .onGoldMultiplierValueKeyDown=${(e: KeyboardEvent) => this.handleGoldMultiplierValueKeyDown(e)}
              .startingGold=${this.startingGold}
              .startingGoldValue=${this.startingGoldValue}
              .onStartingGoldValueInput=${(e: Event) => this.handleStartingGoldValueChanges(e)}
              .onStartingGoldValueKeyDown=${(e: KeyboardEvent) => this.handleStartingGoldValueKeyDown(e)}
              .disableNations=${this.disableNations}
              .onDisableNationsChange=${this.handleDisableNationsChange}
              .onUpdate=${this.putGameConfig}
            ></lobby-game-options>

              <!-- Enabled Items -->
              <div class="space-y-6">
                <div
                  class="flex items-center gap-4 pb-2 border-b border-white/10"
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3
                    class="text-lg font-bold text-white uppercase tracking-wider"
                  >
                    ${translateText("host_modal.enables_title")}
                  </h3>
                </div>
                <div
                  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  ${renderUnitTypeOptions({
                    disabledUnits: this.disabledUnits,
                    toggleUnit: this.toggleUnit.bind(this),
                  })}
                </div>
              </div>

              <!-- Player List -->
              <lobby-player-view
                .gameMode=${this.gameMode}
                .clients=${this.clients}
                .lobbyCreatorClientID=${this.lobbyCreatorClientID}
                .teamCount=${this.teamCount}
                .nationCount=${this.nationCount}
                .disableNations=${this.disableNations}
                .isCompactMap=${this.compactMap}
                .onKickPlayer=${(clientID: string) => this.kickPlayer(clientID)}
              ></lobby-player-view>
            </div>
          </div>

          <!-- Player List / footer -->
          <div class="p-6 pt-4 border-t border-white/10 bg-black/20 shrink-0">
            <button
              class="w-full py-4 text-sm font-bold text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
              @click=${this.startGame}
              ?disabled=${this.clients.length < 2}
            >
              ${
                this.clients.length === 1
                  ? translateText("host_modal.waiting")
                  : translateText("host_modal.start")
              }
            </button>
          </div>
        </div>
      </div>
    `;

    if (this.inline) {
      return content;
    }

    return html`
      <o-modal
        title=""
        ?hideCloseButton=${true}
        ?inline=${this.inline}
        hideHeader
      >
        ${content}
      </o-modal>
    `;
  }

  protected onOpen(): void {
    this.lobbyCreatorClientID = generateID();

    createLobby(this.lobbyCreatorClientID)
      .then(async (lobby) => {
        this.lobbyId = lobby.gameID;
        if (!isValidGameID(this.lobbyId)) {
          throw new Error(`Invalid lobby ID format: ${this.lobbyId}`);
        }
        crazyGamesSDK.showInviteButton(this.lobbyId);
        const url = await this.constructUrl();
        this.updateHistory(url);
      })
      .then(() => {
        this.dispatchEvent(
          new CustomEvent("join-lobby", {
            detail: {
              gameID: this.lobbyId,
              clientID: this.lobbyCreatorClientID,
            } as JoinLobbyEvent,
            bubbles: true,
            composed: true,
          }),
        );
      });
    if (this.modalEl) {
      this.modalEl.onClose = () => {
        this.close();
      };
    }
    this.playersInterval = setInterval(() => this.pollPlayers(), 1000);
    this.loadNationCount();
  }

  private leaveLobby() {
    if (!this.lobbyId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("leave-lobby", {
        detail: { lobby: this.lobbyId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected onClose(): void {
    console.log("Closing host lobby modal");
    if (this.leaveLobbyOnClose) {
      this.leaveLobby();
      this.updateHistory("/"); // Reset URL to base
    }
    crazyGamesSDK.hideInviteButton();

    // Clean up timers and resources
    if (this.playersInterval) {
      clearInterval(this.playersInterval);
      this.playersInterval = null;
    }
    if (this.botsUpdateTimer !== null) {
      clearTimeout(this.botsUpdateTimer);
      this.botsUpdateTimer = null;
    }

    // Reset all transient form state to ensure clean slate
    this.selectedMap = GameMapType.World;
    this.selectedDifficulty = Difficulty.Easy;
    this.disableNations = false;
    this.gameMode = GameMode.FFA;
    this.teamCount = 2;
    this.bots = 400;
    this.spawnImmunity = false;
    this.spawnImmunityDurationMinutes = undefined;
    this.infiniteGold = false;
    this.donateGold = false;
    this.infiniteTroops = false;
    this.donateTroops = false;
    this.maxTimer = false;
    this.maxTimerValue = undefined;
    this.instantBuild = false;
    this.randomSpawn = false;
    this.compactMap = false;
    this.useRandomMap = false;
    this.disabledUnits = [];
    this.lobbyId = "";
    this.clients = [];
    this.lobbyCreatorClientID = "";
    this.nationCount = 0;
    this.goldMultiplier = false;
    this.goldMultiplierValue = undefined;
    this.startingGold = false;
    this.startingGoldValue = undefined;

    this.leaveLobbyOnClose = true;
  }

  private async handleSelectRandomMap() {
    this.useRandomMap = true;
    this.selectedMap = this.getRandomMap();
    await this.loadNationCount();
    this.putGameConfig();
  }

  private async handleMapSelection(value: GameMapType) {
    this.selectedMap = value;
    this.useRandomMap = false;
    await this.loadNationCount();
    this.putGameConfig();
  }

  private async handleDifficultySelection(value: Difficulty) {
    this.selectedDifficulty = value;
    this.putGameConfig();
  }

  // Modified to include debouncing
  private handleBotsChange(e: Event) {
    const customEvent = e as CustomEvent<{ value: number }>;
    const value = customEvent.detail.value;
    if (isNaN(value) || value < 0 || value > 400) {
      return;
    }

    // Update the display value immediately
    this.bots = value;

    // Clear any existing timer
    if (this.botsUpdateTimer !== null) {
      clearTimeout(this.botsUpdateTimer);
    }

    // Set a new timer to call putGameConfig after 300ms of inactivity
    this.botsUpdateTimer = window.setTimeout(() => {
      this.putGameConfig();
      this.botsUpdateTimer = null;
    }, 300);
  }

  private handleInstantBuildChange = (val: boolean) => {
    this.instantBuild = val;
    this.putGameConfig();
  };

  private handleSpawnImmunityDurationKeyDown(e: KeyboardEvent) {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  }

  private handleSpawnImmunityDurationInput(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/[eE+-]/g, "");
    const value = parseInt(input.value, 10);
    if (Number.isNaN(value) || value < 0 || value > 120) {
      return;
    }
    this.spawnImmunityDurationMinutes = value;
    this.putGameConfig();
  }

  private handleGoldMultiplierValueKeyDown(e: KeyboardEvent) {
    if (["+", "-", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  }

  private handleGoldMultiplierValueChanges(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = parseFloat(input.value);

    if (isNaN(value) || value < 0.1 || value > 1000) {
      this.goldMultiplierValue = undefined;
      input.value = "";
    } else {
      this.goldMultiplierValue = value;
    }
    this.putGameConfig();
  }

  private handleStartingGoldValueKeyDown(e: KeyboardEvent) {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  }

  private handleStartingGoldValueChanges(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/[eE+-]/g, "");
    const value = parseInt(input.value);

    if (isNaN(value) || value < 0 || value > 1000000000) {
      this.startingGoldValue = undefined;
    } else {
      this.startingGoldValue = value;
    }
    this.putGameConfig();
  }

  private handleRandomSpawnChange = (val: boolean) => {
    this.randomSpawn = val;
    this.putGameConfig();
  };

  private handleInfiniteGoldChange = (val: boolean) => {
    this.infiniteGold = val;
    this.putGameConfig();
  };

  private handleDonateGoldChange = (val: boolean) => {
    this.donateGold = val;
    this.putGameConfig();
  };

  private handleInfiniteTroopsChange = (val: boolean) => {
    this.infiniteTroops = val;
    this.putGameConfig();
  };

  private handleCompactMapChange = (val: boolean) => {
    this.compactMap = val;
    if (val && this.bots === 400) {
      this.bots = 100;
    } else if (!val && this.bots === 100) {
      this.bots = 400;
    }
    this.putGameConfig();
  };

  private handleDonateTroopsChange = (val: boolean) => {
    this.donateTroops = val;
    this.putGameConfig();
  };

  private handleMaxTimerValueKeyDown(e: KeyboardEvent) {
    if (["-", "+", "e"].includes(e.key)) {
      e.preventDefault();
    }
  }

  private handleMaxTimerValueChanges(e: Event) {
    (e.target as HTMLInputElement).value = (
      e.target as HTMLInputElement
    ).value.replace(/[e+-]/gi, "");
    const value = parseInt((e.target as HTMLInputElement).value);

    if (isNaN(value) || value < 0 || value > 120) {
      return;
    }
    this.maxTimerValue = value;
    this.putGameConfig();
  }

  private handleDisableNationsChange = async (val: boolean) => {
    this.disableNations = val;
    console.log(`updating disable nations to ${this.disableNations}`);
    this.putGameConfig();
  };

  private async handleGameModeSelection(value: GameMode) {
    this.gameMode = value;
    if (this.gameMode === GameMode.Team) {
      this.donateGold = true;
      this.donateTroops = true;
    } else {
      this.donateGold = false;
      this.donateTroops = false;
    }
    this.putGameConfig();
  }

  private async handleTeamCountSelection(value: TeamCountConfig) {
    this.teamCount = value;
    this.putGameConfig();
  }

  private async putGameConfig() {
    const spawnImmunityTicks = this.spawnImmunityDurationMinutes
      ? this.spawnImmunityDurationMinutes * 60 * 10
      : 0;
    const url = await this.constructUrl();
    this.updateHistory(url);
    this.dispatchEvent(
      new CustomEvent("update-game-config", {
        detail: {
          config: {
            gameMap: this.selectedMap,
            gameMapSize: this.compactMap
              ? GameMapSize.Compact
              : GameMapSize.Normal,
            difficulty: this.selectedDifficulty,
            bots: this.bots,
            infiniteGold: this.infiniteGold,
            donateGold: this.donateGold,
            infiniteTroops: this.infiniteTroops,
            donateTroops: this.donateTroops,
            instantBuild: this.instantBuild,
            randomSpawn: this.randomSpawn,
            gameMode: this.gameMode,
            disabledUnits: this.disabledUnits,
            spawnImmunityDuration: this.spawnImmunity
              ? spawnImmunityTicks
              : undefined,
            playerTeams: this.teamCount,
            ...(this.gameMode === GameMode.Team &&
            this.teamCount === HumansVsNations
              ? {
                  disableNations: false,
                }
              : {
                  disableNations: this.disableNations,
                }),
            maxTimerValue:
              this.maxTimer === true ? this.maxTimerValue : undefined,
            goldMultiplier:
              this.goldMultiplier === true
                ? this.goldMultiplierValue
                : undefined,
            startingGold:
              this.startingGold === true ? this.startingGoldValue : undefined,
          } satisfies Partial<GameConfig>,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private toggleUnit(unit: UnitType, checked: boolean): void {
    this.disabledUnits = checked
      ? [...this.disabledUnits, unit]
      : this.disabledUnits.filter((u) => u !== unit);

    this.putGameConfig();
  }

  private getRandomMap(): GameMapType {
    const maps = Object.values(GameMapType);
    const randIdx = Math.floor(Math.random() * maps.length);
    return maps[randIdx] as GameMapType;
  }

  private async startGame() {
    await this.putGameConfig();
    console.log(
      `Starting private game with map: ${GameMapType[this.selectedMap as keyof typeof GameMapType]} ${this.useRandomMap ? " (Randomly selected)" : ""}`,
    );

    // If the modal closes as part of starting the game, do not leave the lobby
    this.leaveLobbyOnClose = false;

    const config = await getServerConfigFromClient();
    const response = await fetch(
      `${window.location.origin}/${config.workerPath(this.lobbyId)}/api/start_game/${this.lobbyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      this.leaveLobbyOnClose = true;
    }
    return response;
  }

  private async pollPlayers() {
    const config = await getServerConfigFromClient();
    fetch(`/${config.workerPath(this.lobbyId)}/api/game/${this.lobbyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data: GameInfo) => {
        this.clients = data.clients ?? [];
      });
  }

  private kickPlayer(clientID: string) {
    // Dispatch event to be handled by WebSocket instead of HTTP
    this.dispatchEvent(
      new CustomEvent("kick-player", {
        detail: { target: clientID },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async loadNationCount() {
    const currentMap = this.selectedMap;
    try {
      const mapData = this.mapLoader.getMapData(currentMap);
      const manifest = await mapData.manifest();
      // Only update if the map hasn't changed
      if (this.selectedMap === currentMap) {
        this.nationCount = manifest.nations.length;
      }
    } catch (error) {
      console.warn("Failed to load nation count", error);
      // Only update if the map hasn't changed
      if (this.selectedMap === currentMap) {
        this.nationCount = 0;
      }
    }
  }
}

async function createLobby(creatorClientID: string): Promise<GameInfo> {
  const config = await getServerConfigFromClient();
  try {
    const id = generateID();
    const response = await fetch(
      `/${config.workerPath(id)}/api/create_game/${id}?creatorClientID=${encodeURIComponent(creatorClientID)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(data), // Include this if you need to send data
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Success:", data);

    return data as GameInfo;
  } catch (error) {
    console.error("Error creating lobby:", error);
    throw error;
  }
}
