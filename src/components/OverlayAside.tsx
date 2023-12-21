import {fabIsOpen} from './FabSignal'
import type {JSXElement} from "solid-js";
import {children, createEffect} from "solid-js";
import "./OverlayAside.scss"

export default function OverlayAside(props: { children: JSXElement }) {
    const [isOpen] = fabIsOpen
    const c = children(() => props.children);
    createEffect(() => {
        // prevent document from scrolling when overlay is shown
        document.body.classList.toggle("overflow-hidden", isOpen())
    })
    return <aside classList={{'z-50': true, sidebar: true, hide: !isOpen()}}>
        {c()}
    </aside>
}