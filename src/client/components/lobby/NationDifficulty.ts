import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { translateText } from "src/client/Utils";
import { Difficulty } from "src/core/game/Game";

/**
 * Nation difficulty selector used in lobby creation.
 */
@customElement("lobby-nation-difficulty")
export class LobbyNationDifficulty extends LitElement {
  @property({ type: String }) selected: Difficulty = Difficulty.Easy;
  @property({ type: Boolean }) disableNations: boolean = false;
  @property({ attribute: false }) onSelect?: (difficulty: Difficulty) => void;

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${Object.entries(Difficulty)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(
                    ([key, value]) => html`
                      <button
                        class="relative group rounded-xl border transition-all duration-200 w-full overflow-hidden flex flex-col items-center p-4 gap-3 ${this
                          .selected === value
                          ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"} ${this
                          .disableNations
                          ? "opacity-30 cursor-not-allowed grayscale"
                          : ""}"
                        @click=${() =>
                          !this.disableNations && this.onSelect?.(value)}
                      >
                        <difficulty-display
                          class="${this.disableNations
                            ? "pointer-events-none"
                            : ""} transform scale-125"
                          .difficultyKey=${key}
                        ></difficulty-display>
                        <div
                          class="text-xs font-bold text-white uppercase tracking-wider text-center w-full mt-1 break-words hyphens-auto"
                        >
                          ${translateText(`difficulty.${key.toLowerCase()}`)}
                        </div>
                      </button>
                    `,
                  )}
              </div>
            </div>

            `;
  }
}
