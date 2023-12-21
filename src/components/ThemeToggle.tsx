import {createEffect, createSignal} from 'solid-js'
import {Icon} from "@iconify-icon/solid";
import moonIcon from "@iconify/icons-feather/moon";
import sunIcon from "@iconify/icons-feather/sun";
import "./ThemeToggle.scss"
import {type Theme, selectedTheme} from "./ThemeSignal";



export default function ThemeToggle(props: { class?: string }) {

    const [theme, setTheme] = selectedTheme
    createEffect(() => {
        document.querySelector("html")?.setAttribute("data-theme", theme())
        window.localStorage.setItem("theme", theme())
    })

    const isDark = () => theme() === "dark"
    const classList: Record<string, boolean> = { "top-7": true, "right-4": true }
    if (props.class) {
        classList[props.class] = true
    }

    return <label classList={classList}>
        <input class="toggle-checkbox" type="checkbox" checked={isDark()} onChange={e => {
            return isDark() ? setTheme("light") : setTheme("dark");
        }
        }/>
        <div class="toggle-slot">
            <div class="sun-icon-wrapper">
                <Icon class="sun-icon" icon={sunIcon}/>
            </div>
            <div class="toggle-button"/>
            <div class="moon-icon-wrapper">
                <Icon class="moon-icon" icon={moonIcon}/>
            </div>
        </div>
    </label>
}