
import {createSignal} from "solid-js";

export type Theme = "dark" | "light";

export const selectedTheme = createSignal<Theme>((globalThis.window && localStorage.getItem("theme")) as Theme ?? "light")
        