import Giscus, { type AvailableLanguage } from "@giscus/solid";
import { selectedTheme } from "./ThemeSignal";
import { type Component, Show, Switch, Match } from "solid-js";


const DiscussionSection: Component<{
    discussionId: number,
    lang?: AvailableLanguage
}> = (props) => {
    const [theme, _] = selectedTheme;

    return <Switch fallback={
        <Giscus
            repo="yujinyan/blog"
            repoId="MDEwOlJlcG9zaXRvcnkxMzA0NjExNDg="
            category="Comments"
            categoryId="DIC_kwDOB8at3M4CbyTj"
            strict="0"
            term={`${props.discussionId}`}
            mapping="number"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme="noborder_light"
            lang={props.lang}
            loading="lazy"
        />
    }>
        <Match when={theme() === 'dark'}>
            <Giscus
                repo="yujinyan/blog"
                repoId="MDEwOlJlcG9zaXRvcnkxMzA0NjExNDg="
                category="Comments"
                categoryId="DIC_kwDOB8at3M4CbyTj"
                strict="0"
                term={`${props.discussionId}`}
                mapping="number"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme="noborder_dark"
                lang={props.lang}
                loading="lazy"
            />
        </Match>
    </Switch>
    
    // Somehow theme is not reactive in the following snippet, using Switch instead as a workaround.

    // const giscusTheme = () => theme() == 'dark' ? 'noborder_dark' : "noborder_light"
    // return <>
    // <div>{giscusTheme()}</div>
    // <Giscus
    //     repo="yujinyan/blog"
    //     repoId="MDEwOlJlcG9zaXRvcnkxMzA0NjExNDg="
    //     category="Comments"
    //     categoryId="DIC_kwDOB8at3M4CbyTj"
    //     strict="0"
    //     term={`${props.discussionId}`}
    //     mapping="number"
    //     reactionsEnabled="1"
    //     emitMetadata="0"
    //     inputPosition="top"
    //     theme={giscusTheme()}
    //     lang={props.lang}
    //     loading="lazy"
    // />
    // </>

}

export default DiscussionSection;