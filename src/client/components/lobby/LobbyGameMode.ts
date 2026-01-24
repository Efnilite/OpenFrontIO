import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TeamCountConfig } from "src/core/Schemas";
import {
  Duos,
  GameMode,
  HumansVsNations,
  Quads,
  Trios,
} from "../../../core/game/Game";
import { translateText } from "../../Utils";

/**
 * Gamemode selector used in lobby creation.
 */
@customElement("lobby-game-mode")
export class LobbyGameMode extends LitElement {
  @property({ type: String }) selectedGameMode: GameMode = GameMode.FFA;
  @property({ type: String }) selectedTeamConfig: TeamCountConfig = 1;
  @property({ attribute: false }) onSelectGameMode?: (
    gamemode: GameMode,
  ) => void;
  @property({ attribute: false }) onSelectTeamConfig?: (
    team: TeamCountConfig,
  ) => void;

  createRenderRoot() {
    return this;
  }

  private handleSelectGameMode(value: GameMode) {
    if (this.onSelectGameMode) {
      this.onSelectGameMode(value);
    }
  }

  private handleSelectTeamConfig(value: TeamCountConfig) {
    if (this.onSelectTeamConfig) {
      this.onSelectTeamConfig(value);
    }
  }

  render() {
    return html`
      <div class="space-y-6 mb-10">
        <div class="flex items-center gap-4 pb-2 border-b border-white/10">
          <div
            class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path
                d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white uppercase tracking-wider">
            ${translateText("host_modal.mode")}
          </h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${[GameMode.FFA, GameMode.Team].map((mode) => {
            const isSelected = this.selectedGameMode === mode;
            return html`
              <button
                class="w-full py-6 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 ${isSelected
                  ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}"
                @click=${() => this.handleSelectGameMode(mode)}
              >
                <span
                  class="text-sm font-bold text-white uppercase tracking-widest wrap-break-word hyphens-auto"
                >
                  ${mode === GameMode.FFA
                    ? translateText("game_mode.ffa")
                    : translateText("game_mode.teams")}
                </span>
              </button>
            `;
          })}
        </div>
      </div>

      ${this.selectedGameMode === GameMode.FFA
        ? ""
        : html`
            <!-- Team Count -->
            <div class="space-y-6 mb-10">
              <div
                class="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 pl-2"
              >
                ${translateText("host_modal.team_count")}
              </div>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                ${[2, 3, 4, 5, 6, 7, Quads, Trios, Duos, HumansVsNations].map(
                  (o) => {
                    const isSelected = this.selectedTeamConfig === o;
                    return html`
                      <button
                        @click=${() => this.handleSelectTeamConfig(o)}
                        class="w-full px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center ${isSelected
                          ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}"
                      >
                        <span
                          class="text-xs font-bold uppercase tracking-wider text-center text-white wrap-break-word hyphens-auto"
                        >
                          ${typeof o === "string"
                            ? o === HumansVsNations
                              ? translateText("public_lobby.teams_hvn")
                              : translateText(`host_modal.teams_${o}`)
                            : translateText("public_lobby.teams", {
                                num: o,
                              })}
                        </span>
                      </button>
                    `;
                  },
                )}
              </div>
            </div>
          `}
    `;
  }
}
