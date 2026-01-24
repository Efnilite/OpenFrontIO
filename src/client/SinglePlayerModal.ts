import { TemplateResult, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { translateText } from "../client/Utils";
import { UserMeResponse } from "../core/ApiSchemas";
import {
  Difficulty,
  GameMapSize,
  GameMapType,
  GameMode,
  GameType,
  HumansVsNations,
  UnitType,
  mapCategories,
} from "../core/game/Game";
import { UserSettings } from "../core/game/UserSettings";
import { TeamCountConfig } from "../core/Schemas";
import { generateID } from "../core/Util";
import { hasLinkedAccount } from "./Api";
import "./components/baseComponents/Button";
import "./components/baseComponents/Modal";
import { BaseModal } from "./components/BaseModal";
import "./components/Difficulties";
import "./components/FluentSlider";
import "./components/lobby/LobbyGameMode";
import "./components/lobby/LobbyNationDifficulty";
import "./components/Maps";
import { modalHeader } from "./components/ui/ModalHeader";
import { fetchCosmetics } from "./Cosmetics";
import { FlagInput } from "./FlagInput";
import { JoinLobbyEvent } from "./Main";
import { UsernameInput } from "./UsernameInput";
import { renderUnitTypeOptions } from "./utilities/RenderUnitTypeOptions";
import randomMap from "/images/RandomMap.webp?url";

@customElement("single-player-modal")
export class SinglePlayerModal extends BaseModal {
  @state() private selectedMap: GameMapType = GameMapType.World;
  @state() private selectedDifficulty: Difficulty = Difficulty.Easy;
  @state() private disableNations: boolean = false;
  @state() private bots: number = 400;
  @state() private infiniteGold: boolean = false;
  @state() private infiniteTroops: boolean = false;
  @state() private compactMap: boolean = false;
  @state() private maxTimer: boolean = false;
  @state() private maxTimerValue: number | undefined = undefined;
  @state() private instantBuild: boolean = false;
  @state() private randomSpawn: boolean = false;
  @state() private useRandomMap: boolean = false;
  @state() private gameMode: GameMode = GameMode.FFA;
  @state() private teamCount: TeamCountConfig = 2;
  @state() private showAchievements: boolean = false;
  @state() private mapWins: Map<GameMapType, Set<Difficulty>> = new Map();
  @state() private userMeResponse: UserMeResponse | false = false;
  @state() private goldMultiplier: boolean = false;
  @state() private goldMultiplierValue: number | undefined = undefined;
  @state() private startingGold: boolean = false;
  @state() private startingGoldValue: number | undefined = undefined;

  @state() private disabledUnits: UnitType[] = [];

  private userSettings: UserSettings = new UserSettings();

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      "userMeResponse",
      this.handleUserMeResponse as EventListener,
    );
  }

  disconnectedCallback() {
    document.removeEventListener(
      "userMeResponse",
      this.handleUserMeResponse as EventListener,
    );
    super.disconnectedCallback();
  }

  private toggleAchievements = () => {
    this.showAchievements = !this.showAchievements;
  };

  private handleUserMeResponse = (
    event: CustomEvent<UserMeResponse | false>,
  ) => {
    this.userMeResponse = event.detail;
    this.applyAchievements(event.detail);
  };

  private renderNotLoggedInBanner(): TemplateResult {
    return html`<div
      class="px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 whitespace-nowrap shrink-0"
    >
      ${translateText("single_modal.sign_in_for_achievements")}
    </div>`;
  }

  private applyAchievements(userMe: UserMeResponse | false) {
    if (!userMe) {
      this.mapWins = new Map();
      return;
    }

    const achievements = Array.isArray(userMe.player.achievements)
      ? userMe.player.achievements
      : [];

    const completions =
      achievements.find(
        (achievement) => achievement?.type === "singleplayer-map",
      )?.data ?? [];

    const winsMap = new Map<GameMapType, Set<Difficulty>>();
    for (const entry of completions) {
      const { mapName, difficulty } = entry ?? {};
      const isValidMap =
        typeof mapName === "string" &&
        Object.values(GameMapType).includes(mapName as GameMapType);
      const isValidDifficulty =
        typeof difficulty === "string" &&
        Object.values(Difficulty).includes(difficulty as Difficulty);
      if (!isValidMap || !isValidDifficulty) continue;

      const map = mapName as GameMapType;
      const set = winsMap.get(map) ?? new Set<Difficulty>();
      set.add(difficulty as Difficulty);
      winsMap.set(map, set);
    }

    this.mapWins = winsMap;
  }

  render() {
    const content = html`
      <div
        class="h-full flex flex-col bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
      >
        <!-- Header -->
        ${modalHeader({
          title: translateText("main.solo") || "Solo",
          onBack: this.close,
          ariaLabel: translateText("common.back"),
          rightContent: hasLinkedAccount(this.userMeResponse)
            ? html`<button
                @click=${this.toggleAchievements}
                class="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shrink-0 ${this
                  .showAchievements
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "text-white/60"}"
              >
                <img
                  src="/images/MedalIconWhite.svg"
                  class="w-4 h-4 opacity-80 shrink-0"
                  style="${this.showAchievements
                    ? ""
                    : "filter: grayscale(1);"}"
                />
                <span
                  class="text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                  >${translateText("single_modal.toggle_achievements")}</span
                >
              </button>`
            : this.renderNotLoggedInBanner(),
        })}

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 mr-1">
          <div class="max-w-5xl mx-auto space-y-6 pt-4">
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
                          const mapKey = Object.keys(GameMapType).find(
                            (key) =>
                              GameMapType[key as keyof typeof GameMapType] ===
                              mapValue,
                          );
                          return html`
                            <div
                              @click=${() => this.handleMapSelection(mapValue)}
                              class="cursor-pointer transition-transform duration-200 active:scale-95"
                            >
                              <map-display
                                .mapKey=${mapKey}
                                .selected=${!this.useRandomMap &&
                                this.selectedMap === mapValue}
                                .showMedals=${this.showAchievements}
                                .wins=${this.mapWins.get(mapValue) ?? new Set()}
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
                <div class="w-full">
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
              .infiniteGold=${this.infiniteGold}
              .onInfiniteGoldChange=${() => {
                this.infiniteGold = !this.infiniteGold;
              }}
              .infiniteTroops=${this.infiniteTroops}
              .onInfiniteTroopsChange=${() => {
                this.infiniteTroops = !this.infiniteTroops;
              }}
              .maxTimer=${this.maxTimer}
              .maxTimerValue=${this.maxTimerValue}
              .onMaxTimerValueInput=${(e: Event) => this.handleMaxTimerValueChanges(e)}
              .onMaxTimerValueKeyDown=${(e: KeyboardEvent) => this.handleMaxTimerValueKeyDown(e)}
              .instantBuild=${this.instantBuild}
              .onInstantBuildChange=${() => {
                this.instantBuild = !this.instantBuild;
              }}
              .randomSpawn=${this.randomSpawn}
              .onRandomSpawnChange=${() => {
                this.randomSpawn = !this.randomSpawn;
              }}
              .compactMap=${this.compactMap}
              .onCompactMapChange=${() => {
                this.compactMap = !this.compactMap;
              }}
              .goldMultiplier=${this.goldMultiplier}
              .goldMultiplierValue=${this.goldMultiplierValue}
              .onGoldMultiplierValueInput=${(e: Event) => this.handleGoldMultiplierValueChanges(e)}
              .onGoldMultiplierValueKeyDown=${(e: KeyboardEvent) => this.handleGoldMultiplierValueKeyDown(e)}
              .startingGold=${this.startingGold}
              .startingGoldValue=${this.startingGoldValue}
              .onStartingGoldValueInput=${(e: Event) => this.handleStartingGoldValueChanges(e)}
              .onStartingGoldValueKeyDown=${(e: KeyboardEvent) => this.handleStartingGoldValueKeyDown(e)}
              .disableNations=${this.disableNations}
              .onDisableNationsChange=${() => {
                this.disableNations = !this.disableNations;
              }}
            ></lobby-game-options>

              <!-- Enable Settings -->
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
                    ${translateText("single_modal.enables_title")}
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
            </div>
          </div>

          <!-- Footer Action -->
          <div class="p-6 pt-4 border-t border-white/10 bg-black/20">
            <button
              @click=${this.startGame}
              class="w-full py-4 text-sm font-bold text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              ${translateText("single_modal.start")}
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
        id="singlePlayerModal"
        title="${translateText("main.solo") || "Solo"}"
        ?inline=${this.inline}
        hideHeader
        hideCloseButton
      >
        ${content}
      </o-modal>
    `;
  }

  // Helper for consistent option buttons
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

  protected onClose(): void {
    // Reset all transient form state to ensure clean slate
    this.selectedMap = GameMapType.World;
    this.selectedDifficulty = Difficulty.Easy;
    this.gameMode = GameMode.FFA;
    this.useRandomMap = false;
    this.disableNations = false;
    this.bots = 400;
    this.infiniteGold = false;
    this.infiniteTroops = false;
    this.compactMap = false;
    this.maxTimer = false;
    this.maxTimerValue = undefined;
    this.instantBuild = false;
    this.randomSpawn = false;
    this.teamCount = 2;
    this.disabledUnits = [];
    this.goldMultiplier = false;
    this.goldMultiplierValue = undefined;
    this.startingGold = false;
    this.startingGoldValue = undefined;
  }

  private handleSelectRandomMap() {
    this.useRandomMap = true;
  }

  private handleMapSelection(value: GameMapType) {
    this.selectedMap = value;
    this.useRandomMap = false;
  }

  private handleDifficultySelection(value: Difficulty) {
    this.selectedDifficulty = value;
  }

  private handleBotsChange(e: Event) {
    const customEvent = e as CustomEvent<{ value: number }>;
    const value = customEvent.detail.value;
    if (isNaN(value) || value < 0 || value > 400) {
      return;
    }
    this.bots = value;
  }

  private handleMaxTimerValueKeyDown(e: KeyboardEvent) {
    if (["-", "+", "e"].includes(e.key)) {
      e.preventDefault();
    }
  }

  private getEndTimerInput(): HTMLInputElement | null {
    return (
      (this.renderRoot.querySelector(
        "#end-timer-value",
      ) as HTMLInputElement | null) ??
      (this.querySelector("#end-timer-value") as HTMLInputElement | null)
    );
  }

  private handleMaxTimerValueChanges(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/[e+-]/gi, "");
    const value = parseInt(input.value);

    // Always update state to keep UI and internal state in sync
    if (isNaN(value) || value < 1 || value > 120) {
      // Set to undefined for invalid/empty/out-of-range values
      this.maxTimerValue = undefined;
    } else {
      this.maxTimerValue = value;
    }
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
  }

  private handleGameModeSelection(value: GameMode) {
    this.gameMode = value;
  }

  private handleTeamCountSelection(value: TeamCountConfig) {
    this.teamCount = value;
  }

  private getRandomMap(): GameMapType {
    const maps = Object.values(GameMapType);
    const randIdx = Math.floor(Math.random() * maps.length);
    return maps[randIdx] as GameMapType;
  }

  private toggleUnit(unit: UnitType, checked: boolean): void {
    this.disabledUnits = checked
      ? [...this.disabledUnits, unit]
      : this.disabledUnits.filter((u) => u !== unit);
  }

  private async startGame() {
    // Validate and clamp maxTimer setting before starting
    let finalMaxTimerValue: number | undefined = undefined;
    if (this.maxTimer) {
      if (!this.maxTimerValue || this.maxTimerValue <= 0) {
        console.error("Max timer is enabled but no valid value is set");
        alert(
          translateText("single_modal.max_timer_invalid") ||
            "Please enter a valid max timer value (1-120 minutes)",
        );
        // Focus the input
        const input = this.getEndTimerInput();
        if (input) {
          input.focus();
          input.select();
        }
        return;
      }
      // Clamp value to valid range
      finalMaxTimerValue = Math.max(1, Math.min(120, this.maxTimerValue));
    }

    // If random map is selected, choose a random map now
    if (this.useRandomMap) {
      this.selectedMap = this.getRandomMap();
    }

    console.log(
      `Starting single player game with map: ${GameMapType[this.selectedMap as keyof typeof GameMapType]}${this.useRandomMap ? " (Randomly selected)" : ""}`,
    );
    const clientID = generateID();
    const gameID = generateID();

    const usernameInput = document.querySelector(
      "username-input",
    ) as UsernameInput;
    if (!usernameInput) {
      console.warn("Username input element not found");
    }

    const flagInput = document.querySelector("flag-input") as FlagInput;
    if (!flagInput) {
      console.warn("Flag input element not found");
    }
    const cosmetics = await fetchCosmetics();
    let selectedPattern = this.userSettings.getSelectedPatternName(cosmetics);
    selectedPattern ??= cosmetics
      ? (this.userSettings.getDevOnlyPattern() ?? null)
      : null;

    const selectedColor = this.userSettings.getSelectedColor();

    this.dispatchEvent(
      new CustomEvent("join-lobby", {
        detail: {
          clientID: clientID,
          gameID: gameID,
          gameStartInfo: {
            gameID: gameID,
            players: [
              {
                clientID,
                username: usernameInput.getCurrentUsername(),
                cosmetics: {
                  flag:
                    flagInput.getCurrentFlag() === "xx"
                      ? ""
                      : flagInput.getCurrentFlag(),
                  pattern: selectedPattern ?? undefined,
                  color: selectedColor ? { color: selectedColor } : undefined,
                },
              },
            ],
            config: {
              gameMap: this.selectedMap,
              gameMapSize: this.compactMap
                ? GameMapSize.Compact
                : GameMapSize.Normal,
              gameType: GameType.Singleplayer,
              gameMode: this.gameMode,
              playerTeams: this.teamCount,
              difficulty: this.selectedDifficulty,
              maxTimerValue: finalMaxTimerValue,
              bots: this.bots,
              infiniteGold: this.infiniteGold,
              donateGold: this.gameMode === GameMode.Team,
              donateTroops: this.gameMode === GameMode.Team,
              infiniteTroops: this.infiniteTroops,
              instantBuild: this.instantBuild,
              randomSpawn: this.randomSpawn,
              disabledUnits: this.disabledUnits
                .map((u) => Object.values(UnitType).find((ut) => ut === u))
                .filter((ut): ut is UnitType => ut !== undefined),
              ...(this.gameMode === GameMode.Team &&
              this.teamCount === HumansVsNations
                ? {
                    disableNations: false,
                  }
                : {
                    disableNations: this.disableNations,
                  }),
              ...(this.goldMultiplier && this.goldMultiplierValue
                ? { goldMultiplier: this.goldMultiplierValue }
                : {}),
              ...(this.startingGold && this.startingGoldValue !== undefined
                ? { startingGold: this.startingGoldValue }
                : {}),
            },
            lobbyCreatedAt: Date.now(), // ms; server should be authoritative in MP
          },
        } satisfies JoinLobbyEvent,
        bubbles: true,
        composed: true,
      }),
    );
    this.close();
  }
}
