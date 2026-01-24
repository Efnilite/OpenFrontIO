import { LitElement, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  renderToggleInputCard,
  renderToggleInputCardInput,
} from "src/client/utilities/RenderToggleInputCard";
import { TeamCountConfig } from "src/core/Schemas";
import { GameMode, HumansVsNations } from "../../../core/game/Game";
import { translateText } from "../../Utils";

/**
 * Options selector used in lobby creation.
 */
@customElement("lobby-game-options")
export class LobbyGameOptions extends LitElement {
  @property({ type: Number }) bots: number = 0;
  @property({ type: String }) gameMode: GameMode = GameMode.FFA;
  @property({ type: Number }) teamCount: TeamCountConfig = 1;
  @property({ type: Boolean }) disableNations: boolean = false;
  @property({ type: Boolean }) instantBuild: boolean = false;
  @property({ type: Boolean }) randomSpawn: boolean = false;
  @property({ type: Boolean }) donateGold?: boolean = false;
  @property({ type: Boolean }) donateTroops?: boolean = false;
  @property({ type: Boolean }) infiniteGold: boolean = false;
  @property({ type: Boolean }) infiniteTroops: boolean = false;
  @property({ type: Boolean }) compactMap: boolean = false;
  @property({ type: Boolean }) maxTimer?: boolean = false;
  @property({ type: Number }) maxTimerValue?: number = 0;
  @property({ type: Boolean }) spawnImmunity?: boolean = false;
  @property({ type: Number }) spawnImmunityDurationMinutes?: number = 0;
  @property({ type: Boolean }) goldMultiplier: boolean = false;
  @property({ type: Number }) goldMultiplierValue: number = 1;
  @property({ type: Boolean }) startingGold: boolean = false;
  @property({ type: Number }) startingGoldValue: number = 0;

  @property({ attribute: false }) onSelectBots: (e: CustomEvent) => void =
    () => {};
  @property({ attribute: false }) onSelectDisableNations: (
    val: boolean,
  ) => void = () => {};
  @property({ attribute: false }) onSelectInstantBuild: (val: boolean) => void =
    () => {};
  @property({ attribute: false }) onSelectRandomSpawn: (val: boolean) => void =
    () => {};
  @property({ attribute: false }) onSelectDonateGold?: (val: boolean) => void =
    () => {};
  @property({ attribute: false }) onSelectDonateTroops?: (
    val: boolean,
  ) => void = () => {};
  @property({ attribute: false }) onSelectInfiniteGold: (val: boolean) => void =
    () => {};
  @property({ attribute: false }) onSelectInfiniteTroops: (
    val: boolean,
  ) => void = () => {};
  @property({ attribute: false }) onSelectCompactMap: (val: boolean) => void =
    () => {};
  @property({ attribute: false }) onSelectMaxTimerValues?: (e: Event) => void =
    () => {};
  @property({ attribute: false }) onSelectMaxTimerValueKeyDown?: (
    e: KeyboardEvent,
  ) => void = () => {};
  @property({ attribute: false }) onSelectSpawnImmunityDurationInput?: (
    e: Event,
  ) => void = () => {};
  @property({ attribute: false }) onSelectSpawnImmunityDurationKeyDown?: (
    e: KeyboardEvent,
  ) => void = () => {};
  @property({ attribute: false }) onSelectGoldMultiplierValues: (
    e: Event,
  ) => void = () => {};
  @property({ attribute: false }) onSelectGoldMultiplierValueKeyDown: (
    e: KeyboardEvent,
  ) => void = () => {};
  @property({ attribute: false }) onSelectStartingGoldValues: (
    e: Event,
  ) => void = () => {};
  @property({ attribute: false }) onSelectStartingGoldValueKeyDown: (
    e: KeyboardEvent,
  ) => void = () => {};
  @property({ attribute: false }) onUpdate: () => void = () => {};

  @property({ attribute: false }) maxTimerHandlers: { click: () => void } = {
    click: () => {},
  };
  @property({ attribute: false }) spawnImmunityHandlers: { click: () => void } =
    { click: () => {} };
  @property({ attribute: false }) goldMultiplierHandlers: {
    click: () => void;
  } = { click: () => {} };
  @property({ attribute: false }) startingGoldHandlers: { click: () => void } =
    { click: () => {} };

  createRenderRoot() {
    return this;
  }

  render() {
    const maxTimerHandlers = this.createToggleHandlers(
      () => this.maxTimer,
      (val) => (this.maxTimer = val),
      () => this.maxTimerValue,
      (val) => (this.maxTimerValue = val!),
      30,
    );
    const spawnImmunityHandlers = this.createToggleHandlers(
      () => this.spawnImmunity,
      (val) => (this.spawnImmunity = val),
      () => this.spawnImmunityDurationMinutes,
      (val) => (this.spawnImmunityDurationMinutes = val!),
      5,
    );
    const goldMultiplierHandlers = this.createToggleHandlers(
      () => this.goldMultiplier,
      (val) => (this.goldMultiplier = val),
      () => this.goldMultiplierValue,
      (val) => (this.goldMultiplierValue = val!),
      2,
    );
    const startingGoldHandlers = this.createToggleHandlers(
      () => this.startingGold,
      (val) => (this.startingGold = val),
      () => this.startingGoldValue,
      (val) => (this.startingGoldValue = val!),
      5000000,
    );

    return html`
      <!-- Game Options -->
      <div class="space-y-6">
        <div class="flex items-center gap-4 pb-2 border-b border-white/10">
          <div
            class="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path
                fill-rule="evenodd"
                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white uppercase tracking-wider">
            ${translateText("host_modal.options_title")}
          </h3>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Bots Slider -->
          <div
            class="col-span-2 rounded-xl p-4 flex flex-col justify-center min-h-25 border transition-all duration-200 ${this
              .bots > 0
              ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 opacity-80"}"
          >
            <fluent-slider
              min="0"
              max="400"
              s
              step="1"
              .value=${this.bots}
              labelKey="host_modal.bots"
              disabledKey="host_modal.bots_disabled"
              @value-changed=${this.onSelectBots}
            ></fluent-slider>
          </div>

          ${!(
            this.gameMode === GameMode.Team &&
            this.teamCount === HumansVsNations
          )
            ? this.renderOptionToggle(
                "host_modal.disable_nations",
                this.disableNations,
                this.onSelectDisableNations,
              )
            : ""}
          ${this.renderOptionToggle(
            "host_modal.instant_build",
            this.instantBuild,
            this.onSelectInstantBuild,
          )}
          ${this.renderOptionToggle(
            "host_modal.random_spawn",
            this.randomSpawn,
            this.onSelectRandomSpawn,
          )}
          ${this.donateGold &&
          this.onSelectDonateGold &&
          this.renderOptionToggle(
            "host_modal.donate_gold",
            this.donateGold,
            this.onSelectDonateGold,
          )}
          ${this.donateTroops &&
          this.onSelectDonateTroops &&
          this.renderOptionToggle(
            "host_modal.donate_troops",
            this.donateTroops,
            this.onSelectDonateTroops,
          )}
          ${this.renderOptionToggle(
            "host_modal.infinite_gold",
            this.infiniteGold,
            this.onSelectInfiniteGold,
          )}
          ${this.renderOptionToggle(
            "host_modal.infinite_troops",
            this.infiniteTroops,
            this.onSelectInfiniteTroops,
          )}
          ${this.renderOptionToggle(
            "host_modal.compact_map",
            this.compactMap,
            this.onSelectCompactMap,
          )}

          <!-- Max Timer -->
          ${this.maxTimer &&
          renderToggleInputCard({
            labelKey: "host_modal.max_timer",
            checked: this.maxTimer,
            onClick: maxTimerHandlers.click,
            input: renderToggleInputCardInput({
              min: 0,
              max: 120,
              value: this.maxTimerValue ?? 0,
              ariaLabel: translateText("host_modal.max_timer"),
              placeholder: translateText("host_modal.mins_placeholder"),
              onInput: this.onSelectMaxTimerValues,
              onKeyDown: this.onSelectMaxTimerValueKeyDown,
            }),
          })}

          <!-- Spawn Immunity -->
          ${this.spawnImmunity &&
          renderToggleInputCard({
            labelKey: "host_modal.player_immunity_duration",
            checked: this.spawnImmunity,
            onClick: spawnImmunityHandlers.click,
            input: renderToggleInputCardInput({
              min: 0,
              max: 120,
              step: 1,
              value: this.spawnImmunityDurationMinutes ?? 0,
              ariaLabel: translateText("host_modal.player_immunity_duration"),
              placeholder: translateText("host_modal.mins_placeholder"),
              onInput: this.onSelectSpawnImmunityDurationInput,
              onKeyDown: this.onSelectSpawnImmunityDurationKeyDown,
            }),
          })}

          <!-- Gold Multiplier -->
          ${renderToggleInputCard({
            labelKey: "single_modal.gold_multiplier",
            checked: this.goldMultiplier,
            onClick: goldMultiplierHandlers.click,
            input: renderToggleInputCardInput({
              id: "gold-multiplier-value",
              min: 0.1,
              max: 1000,
              step: "any",
              value: this.goldMultiplierValue ?? "",
              ariaLabel: translateText("single_modal.gold_multiplier"),
              placeholder: translateText(
                "single_modal.gold_multiplier_placeholder",
              ),
              onChange: this.onSelectGoldMultiplierValues,
              onKeyDown: this.onSelectGoldMultiplierValueKeyDown,
            }),
          })}

          <!-- Starting Gold -->
          ${renderToggleInputCard({
            labelKey: "single_modal.starting_gold",
            checked: this.startingGold,
            onClick: startingGoldHandlers.click,
            input: renderToggleInputCardInput({
              id: "starting-gold-value",
              min: 0,
              max: 1000000000,
              step: 100000,
              value: this.startingGoldValue ?? "",
              ariaLabel: translateText("single_modal.starting_gold"),
              placeholder: translateText(
                "single_modal.starting_gold_placeholder",
              ),
              onInput: this.onSelectStartingGoldValues,
              onKeyDown: this.onSelectStartingGoldValueKeyDown,
            }),
          })}
        </div>
      </div>
    `;
  }

  private createToggleHandlers(
    toggleStateGetter: () => boolean,
    toggleStateSetter: (val: boolean) => void,
    valueGetter: () => number | undefined,
    valueSetter: (val: number | undefined) => void,
    defaultValue: number = 0,
  ) {
    const toggleLogic = () => {
      const newState = !toggleStateGetter();
      toggleStateSetter(newState);
      if (newState) {
        valueSetter(valueGetter() ?? defaultValue);
      } else {
        valueSetter(undefined);
      }
      this.onUpdate();
      this.requestUpdate();
    };

    return {
      click: (e: Event) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === "input") return;
        toggleLogic();
      },
      keydown: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === "input") return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleLogic();
        }
      },
    };
  }

  private renderOptionToggle(
    labelKey: string,
    checked: boolean,
    onChange: (val: boolean) => void,
    hidden: boolean = false,
  ): TemplateResult {
    if (hidden) return html``;

    return html`
      <button
        class="relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 h-full min-h-25 w-full cursor-pointer ${checked
          ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 opacity-80"}"
        @click=${() => onChange(!checked)}
      >
        <div
          class="text-xs uppercase font-bold tracking-wider text-center w-full leading-tight wrap-break-word hyphens-auto ${checked
            ? "text-white"
            : "text-white/60"}"
        >
          ${translateText(labelKey)}
        </div>
      </button>
    `;
  }
}
