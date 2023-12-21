import type {MarkdownHeading} from 'astro';
import type {JSX, ParentComponent} from "solid-js"
import {children, createSignal, For, Show} from "solid-js";
import useScrollSpy from "./scroll-spy-hook.solid.ts"

// import { unescape } from '../../util/html-entities';
import './TableOfContents.scss';

interface Props {
    headings: MarkdownHeading[],
    // toc: TocItem[];
    isMobile?: boolean;
    children?: JSX.Element;
}

interface TocItem extends MarkdownHeading {
    children: TocItem[];
}

function TableOfContents(props: Props) {
    const toc = generateToc(props.headings);
    if (toc.length === 0) return null;
    const [currentHeading, setCurrentHeading] = createSignal({
        slug: toc[0].slug,
        text: toc[0].text,
    });
    const isMobile = props.isMobile
    const [open, setOpen] = createSignal(!isMobile);
    const onThisPageID = 'on-this-page-heading';
    // console.log(props.headings);

    const isActive = useScrollSpy(props.headings.map(x => x.slug));
    const c = children(() => props.children)

    const Container: ParentComponent = (props) => {
        const c = children(() => props.children);
        return isMobile? (
            <details
                open={open()}
                onToggle={(e) => setOpen(e.currentTarget.open)}
                class="toc-container"
            >
                {c()}
            </details>
        ) : (
            <>{c()}</>
        );
    };

    function HeadingContainer(props: { children: JSX.Element; }) {
        const c = children(() => props.children)
        return isMobile ? (
            <summary class="toc-mobile-header">
                <div class="toc-mobile-header-content">
                    <div class="toc-toggle">
                        {c()}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 1 16 16"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"
                            ></path>
                        </svg>
                    </div>
                    {!open && currentHeading()?.slug !== 'overview' && (
                        <span class="toc-current-heading">{unescape(currentHeading()?.text || '')}</span>
                    )}
                </div>
            </summary>
        ) : (
            children
        );
    }

    function TableOfContentsItem({ heading }: { heading: TocItem; }) {
        const { depth, slug, text, children } = heading;
        return (
            <li>
                <a
                    class={`header-link depth-${depth} ${currentHeading().slug === slug ? 'current-header-link' : ''} ${isActive(slug) ? "isActive" : ""}`.trim()}
                    href={`#${slug}`}
                    onClick={function (e) {
                        if (!isMobile) return;
                        setOpen(false);
                        setCurrentHeading({
                            slug: e.currentTarget.getAttribute('href')!.replace('#', ''),
                            text: e.currentTarget.textContent || '',
                        });
                    }}
                >
                    {/* {unescape(text)} */}
                    {text}
                </a>
                <Show when={children.length > 0}>
                    <ul>
                        <For each={children}>
                            { heading => <TableOfContentsItem  heading={heading} /> }
                        </For>
                    </ul>
                </Show>
            </li>
        );
    }

    return (
        <Container>
            <ul class="toc-root">
                <For each={toc}>
                    { heading2 => <TableOfContentsItem heading={heading2} /> }
                </For>
            </ul>
        </Container>
    );
}


export function generateToc(headings: MarkdownHeading[]) {
    const toc: Array<TocItem> = [];
    for (const heading of headings) {
        if (toc.length === 0) {
            toc.push({
                ...heading,
                children: [],
            });
        } else {
            const lastItemInToc = toc[toc.length - 1];
            if (heading.depth < lastItemInToc.depth) {
                throw new Error(`Orphan heading found: ${heading.text}.`);
            }
            if (heading.depth === lastItemInToc.depth) {
                // same depth
                toc.push({
                    ...heading,
                    children: [],
                });
            } else {
                // higher depth
                // push into children, or children' children alike
                const gap = heading.depth - lastItemInToc.depth;
                const target = diveChildren(lastItemInToc, gap);
                target.push({
                    ...heading,
                    children: [],
                });
            }
        }
    }
    return toc;
}
function diveChildren(item: TocItem, depth: number): TocItem[] {
    if (depth === 1) {
        return item.children;
    } else {
        // e.g., 2
        return diveChildren(
            item.children[item.children.length - 1],
            depth - 1
        );
    }
}

export default TableOfContents;