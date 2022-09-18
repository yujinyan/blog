import React from "react"
import "./style.scss"
import Hamburger from "hamburger-react"

type FabProps = {
  isOpen: boolean,
  setOpen: (boolean) => void,
  className?: string
}

const Fab = ({ isOpen, setOpen, className }: FabProps) => (
  <div className={`fab ${className}`}>
    <Hamburger
      size={24}
      color="white"
      rounded
      toggled={isOpen}
      toggle={setOpen}
    />
  </div>
)

export default Fab
