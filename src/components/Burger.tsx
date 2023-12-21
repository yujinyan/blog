import {type Component, createSignal, type JSXElement} from 'solid-js';

const area = 48;


const Burger: Component<BurgerProps> = (props) => {
    const color = props.color || 'currentColor'
    const direction = props.direction || 'left'
    const distance = props.distance || 'md'
    const duration = props.duration || 0.4
    const easing = props.easing || 'cubic-bezier(0, 0, 0, 1)'
    const hideOutline = props.hideOutline || true
    const label = props.label
    const lines = props.lines || 3
    const onToggle = props.onToggle
    const render = props.render
    const rounded = props.rounded || false
    const size = props.size || 32
    const toggle = props.toggle
    const toggled = () => props.toggled
    const [toggledInternal, setToggledInternal] = createSignal(false);

    const width = Math.max(12, Math.min(area, size));
    const room = Math.round((area - width) / 2);

    const barHeightRaw = width / 12;
    const barHeight = Math.round(barHeightRaw);

    const space = distance === 'lg' ? 0.25 : distance === 'sm' ? 0.75 : 0.5;
    const marginRaw = width / (lines * (space + (lines === 3 ? 1 : 1.25)));
    const margin = Math.round(marginRaw);

    const height = (barHeight * lines) + margin * (lines - 1);
    const topOffset = Math.round((area - height) / 2);

    const translate = lines === 3
        ? distance === 'lg' ? 4.0425 : distance === 'sm' ? 5.1625 : 4.6325
        : distance === 'lg' ? 6.7875 : distance === 'sm' ? 8.4875 : 7.6675;
    const deviation = ((barHeightRaw - barHeight) + (marginRaw - margin)) / (lines === 3 ? 1 : 2);
    const move = parseFloat(((width / translate) - (deviation / (4 / 3))).toFixed(2));
    const time = Math.max(0, duration);

    const burgerStyles: Record<string, any> = {
        cursor: 'pointer',
        height: `${area}px`,
        position: 'relative',
        transition: `${time}s ${easing}`,
        userSelect: 'none',
        width: `${area}px`,
    };

    const barStyles: Record<string, any> = {
        background: color,
        height: `${barHeight}px`,
        left: `${room}px`,
        position: 'absolute',
    };

    if (hideOutline) {
        burgerStyles['outline'] = 'none';
    }

    if (rounded) {
        barStyles['borderRadius'] = '9em';
    }

    const toggleFunction = toggle || setToggledInternal;
    const isToggled = () => {
        const t = toggled()
        if (t === undefined) {
            return toggledInternal()
        } else {
            return t;
        }
    };

    const handler = () => {
        toggleFunction(!isToggled());
        if (typeof onToggle === 'function') onToggle(!isToggled());
    };

    return render({
        barHeight,
        barStyles,
        burgerStyles,
        easing,
        handler,
        isLeft: (direction === 'left'),
        isToggled,
        label,
        margin,
        move,
        time,
        topOffset,
        width,
    });
};


export interface CommonBurgerProps {
    /** The color of the icon bars, accepts any CSS-parsable argument. */
    color?: string;
    /** The animation direction of the icon, left or right. */
    direction?: 'left' | 'right';
    /** The vertical distance between the lines. Small (sm), medium (md) or large (lg). */
    distance?: 'sm' | 'md' | 'lg';
    /** The duration of the animation. Can be set to zero if no animation is desired. */
    duration?: number;
    /** A valid `transition-timing-function` CSS value, for example 'ease-out'. */
    easing?: string;
    /** Hides the default browser focus style. */
    hideOutline?: boolean;
    /** An ARIA label to improve accessibility. */
    label?: string;
    /** A callback which receives a single boolean argument, indicating if the icon is toggled. */
    onToggle?: (toggled: boolean) => any;
    /** Specifies if the icon bars should be rounded. */
    rounded?: boolean;
    /** A number between 12 and 48, which sets the size of the icon. */
    size?: number;
    /** A way to provide your own state action. Has to be used together with a state value (the `toggled` prop). */
    toggle?: (value: boolean | ((prevState: boolean) => boolean)) => void
    /** A way to provide your own state value. Can be used together with a state action (the `toggle` prop). */
    toggled?: boolean;
}

export interface RenderOptions {
    barHeight: number;
    barStyles: CSSProperties;
    burgerStyles: CSSProperties;
    handler: () => void;
    isLeft: boolean;
    isToggled: () => boolean;
    label: string | undefined;
    margin: number;
    move: number;
    time: number;
    easing: string;
    topOffset: number;
    width: number;
}

export interface BurgerProps extends CommonBurgerProps {
    render: (o: RenderOptions) => JSXElement;
    lines?: number;
}

type CSSProperties = Record<string, string>

export const Tilt = ((props) => (
    <Burger {...props} render={(o) => {
        return (
            <div
                class="hamburger-react"
                aria-label={o.label}
                aria-expanded={o.isToggled()}
                data-testid="tilt"
                onClick={o.handler}
                onKeyUp={(e) => e.key === 'Enter' && o.handler()}
                role="button"
                style={{
                    ...o.burgerStyles,
                    transform: `${o.isToggled()
                        ? `rotate(${90 * (o.isLeft ? -1 : 1)}deg)`
                        : 'none'
                    }`,
                }}
                tabIndex={0}
            >
                <div data-testid="bar-one" style={{
                    ...o.barStyles,
                    width: `${o.width}px`,
                    top: `${o.topOffset}px`,
                    transition: `${o.time}s ${o.easing}`,
                    transform: `${o.isToggled()
                        ? `rotate(${45 * (o.isLeft ? -1 : 1)}deg) translate(${o.move * (o.isLeft ? -1 : 1)}px, ${o.move}px)`
                        : 'none'
                    }`,
                }}/>

                <div data-testid="bar-two" style={{
                    ...o.barStyles,
                    width: `${o.width}px`,
                    top: `${o.topOffset + o.barHeight + o.margin}px`,
                    transition: `${o.time}s ${o.easing}`,
                    transform: `${o.isToggled()
                        ? 'scaleX(0)'
                        : 'none'
                    }`,
                }}/>

                <div data-testid="bar-three" style={{
                    ...o.barStyles,
                    width: `${o.width}px`,
                    top: `${o.topOffset + o.barHeight * 2 + o.margin * 2}px`,
                    transition: `${o.time}s ${o.easing}`,
                    transform: `${o.isToggled()
                        ? `rotate(${45 * (o.isLeft ? 1 : -1)}deg) translate(${o.move * (o.isLeft ? -1 : 1)}px, ${o.move * -1}px)`
                        : 'none'
                    }`,
                }}/>
            </div>
        );
    }}/>
)) as Component<CommonBurgerProps>

export default Tilt;
