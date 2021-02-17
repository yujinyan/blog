import React from "react"
import PropTypes from "prop-types"
import "./style.scss"
import Hamburger from "hamburger-react"

const Fab = ({ isOpen, setOpen }) => (
  <>
    <div className="fab">
      <Hamburger
        size={24}
        color="white"
        rounded
        toggled={isOpen}
        toggle={setOpen}
      />
    </div>
    <div className={`fab-bg ${isOpen ? "" : "hide"}`} />
  </>
)

Fab.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setOpen: PropTypes.func,
}

export default Fab
