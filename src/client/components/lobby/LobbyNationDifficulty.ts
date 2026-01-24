import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Difficulty } from "../../../core/game/Game";
import { translateText } from "../../Utils";

/**
 * Nation difficulty selector used in lobby creation.
 */
@customElement("lobby-nation-difficulty")
export class LobbyNationDifficulty extends LitElement {
  @property({ type: String }) selected: Difficulty = Difficulty.Easy;
  @property({ type: Boolean }) disabled: boolean = false;
  @property({ attribute: false }) onSelect?: (difficulty: Difficulty) => void;

  createRenderRoot() {
    return this;
  }

  private handleSelect(value: Difficulty) {
    if (!this.disabled && this.onSelect) {
      this.onSelect(value);
    }
  }

  render() {
    return html`
      <div class="space-y-6 mb-10">
        <div class="flex items-center gap-4 pb-2 border-b border-white/10">
          <div
            class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path
                fill-rule="evenodd"
                d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white uppercase tracking-wider">
            ${translateText("difficulty.difficulty")}
          </h3>
        </div>

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
                    .disabled
                    ? "opacity-30 cursor-not-allowed grayscale"
                    : ""}"
                  @click=${() => this.handleSelect(value)}
                  ?disabled=${this.disabled}
                >
                  <difficulty-display
                    class="${this.disabled
                      ? "pointer-events-none"
                      : ""} transform scale-125"
                    .difficultyKey=${key}
                  ></difficulty-display>
                  <div
                    class="text-xs font-bold text-white uppercase tracking-wider text-center w-full mt-1 wrap-break-word hyphens-auto"
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
