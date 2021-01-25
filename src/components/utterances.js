import React from "react"
import { scale } from "../utils/typography"

export const UtterancesComments = (props) => (
  <>
    <h2 style={{ marginBottom: 0, marginTop: 0 }}>Comments</h2>
    <p style={{ ...scale(-1 / 5), marginBottom: 0, fontStyle: "italic" }}>You can also comment on <a
      href={`https://github.com/yujinyan/blog/issues/${props.issueId}`}
      target="_blank"
      rel="noopener noreferrer"
    >this GitHub issue</a> directly.</p>
    <section
      ref={elem => {
        if (!elem) {
          return;
        }
        const scriptElem = document.createElement("script");
        scriptElem.src = "https://utteranc.es/client.js";
        scriptElem.async = true;
        scriptElem.crossOrigin = "anonymous";
        scriptElem.setAttribute("repo", "yujinyan/blog");
        scriptElem.setAttribute("issue-number", props.issueId);
        scriptElem.setAttribute("theme", "preferred-color-scheme");
        elem.appendChild(scriptElem);
      }}
    />
  </>
);