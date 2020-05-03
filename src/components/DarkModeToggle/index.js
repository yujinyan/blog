import React from "react"
import { Icon } from "@iconify/react"
import { ThemeToggler } from "gatsby-plugin-dark-mode"
import moonIcon from "@iconify/icons-feather/moon"
import sunIcon from "@iconify/icons-feather/sun"
import "./style-feather.scss"

const DarkModeToggle = () => (
  <ThemeToggler>
    {({ theme, toggleTheme }) =>
      theme && (
        <label>
          <input
            className="toggle-checkbox"
            checked={theme === "dark"}
            onChange={e => toggleTheme(e.target.checked ? "dark" : "light")}
            type="checkbox"
          />
          <div className="toggle-slot">
            <div className="sun-icon-wrapper">
              <Icon className="sun-icon" icon={sunIcon} />
            </div>
            <div className="toggle-button"></div>
            <div className="moon-icon-wrapper">
              <Icon className="moon-icon" icon={moonIcon} />
            </div>
          </div>
        </label>
      )
    }
  </ThemeToggler>
)

export default DarkModeToggle
