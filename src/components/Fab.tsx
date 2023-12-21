import Burger from "@/components/Burger.tsx";
import {fabIsOpen} from "@/components/FabSignal";
import "./Fab.scss";

type FabProps = {
    className?: string
}


const Fab = (props: FabProps) => {
    const [isOpen, setOpen] = fabIsOpen
    return (
        <div class={`fab ${props.className}`}>
            <Burger
                size={24}
                color="white"
                rounded
                toggled={isOpen()}
                onToggle={(x) => {
                    return setOpen(x);
                }}
            />
        </div>
    );
}
export default Fab