import { classnames } from "hast-util-classnames";
import { Child } from "hastscript";
import { h } from "hastscript";

export const wrap = (element: Child, tagName: string) => h(tagName, {}, element);
export const cls = (element: Child, className: string) => {
  if (typeof element === "object" && ("type" in element) && element.type === "element")
    return classnames(element, className);
  return h("span", { class: className }, element);
}

// red, orange, yellow, green, indigo, purple
const COLOR_MAP = ["current", "red", "orange", "yellow", "green", "indigo", "purple"];
function mapColor(color: string | number, saturation: number) {
  if (typeof color === "number")
    return color === 0 ? COLOR_MAP[color] : COLOR_MAP[color] + "-" + saturation;
  return `[${color}]`
}

/** Make text */
function t(text: string) {
  return { type: "text" as const, value: text };
}

export function m(ele: Ele): Child | undefined {
  if (typeof ele === "string") {
    return t(ele);
  }
  if (!ele.text) return undefined;

  // rich text
  let tree: Child = t(ele.text);
  if (ele.i === 'x') {
    const { block, latexClozes, text } = ele;
    // https://www.npmjs.com/package/remark-math
    if (block) {
      tree = classnames(h("pre",
        h("code", [tree])
      ), ["language-math", "math-display"]);
    } else {
      tree = h("code", { class: "language-math math-inline" }, tree);
    }
  }

  if (ele.b) {
    // bold
    tree = wrap(tree, "b");
  }
  if (ele.l) {
    // italic
    tree = wrap(tree, "em");
  }
  if (ele.u) {
    // underline
    tree = wrap(tree, "u");
  }
  if (ele.tc) {
    // text color, can be number (1, 2, 3) or hex string (#ff0000)
    tree = cls(tree, `text-${mapColor(ele.tc, 600)}`);
  }
  if (ele.h) {
    // highlight color, can be number (1, 2, 3) or hex string (#ff0000)
    tree = cls(tree, `bg-${mapColor(ele.h, 300)}`);
  }
  if (ele.url) {
    // img
    const title = ele.title || "";
    const { url, width, height } = ele;
    tree = h("img", { src: url, alt: title, width, height });
  }
  if (ele.qId) {
    // url
    tree = h("a", { href: `https://www.remnote.io/document/${ele.qId}` }, tree);
  }

  if (ele.cId) {
    // cloze
    tree = h("span",
      { className: "cloze" },
      [
        h("input", { type: "checkbox", id: ele.cId }),
        h("label", { for: ele.cId }, "[...]"),
        h("label", { for: ele.cId }, tree),
      ]
    )
  }
  return tree;
}
