import React from "react"
import PropTypes from "prop-types"
import "./style.scss"
import Hamburger from "hamburger-react"

const Fab = ({ isOpen, setOpen, className }) => (
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

Fab.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setOpen: PropTypes.func,
  className: PropTypes.string,
}

export default Fab
