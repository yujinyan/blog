import type { JSXElement, ParentComponent } from "solid-js"

 const Figure: ParentComponent<{image: JSXElement}> = (props)  => 
    <figure class="m-auto">
        {props.image}
        <figcaption>
            <slot class="m-0" name="caption" />
        </figcaption>
    </figure>

export default Figure