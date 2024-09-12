import { classnames } from "hast-util-classnames";
import type { Child } from "hastscript";
import { h } from "hastscript";

export const wrap = (element: Child, tagName: string) => h(tagName, {}, element);
export const cls = (element: Child, className: string) => {
  if (typeof element === "object" && ("type" in element) && element.type === "element")
    return classnames(element, className);
  return h("span", { class: className }, element);
}

// red, orange, yellow, green, indigo, purple
function mapColor(color: string | number, saturation: number, map: string[]) {
  if (typeof color === "number")
    return color === 0 ? map[color] : `${map[color]}-${saturation}`;
  return `[${color}]`
}

/** Make text */
export function t(text: string) {
  return { type: "text" as const, value: text };
}

export function m(ele: Ele, config: XformConfig): Child | undefined {
  if (typeof ele === "string") {
    return t(ele);
  }

  // rich text
  let tree: Child;
  if (ele.i === 'x') {
    const { block, latexClozes, text } = ele;
    tree = t(text);
    // https://www.npmjs.com/package/remark-math
    if (block) {
      tree = classnames(h("pre",
        h("code", [tree])
      ), ["language-math", "math-display"]);
    } else {
      tree = h("code", { class: "language-math math-inline" }, tree);
    }
  } else if (ele.i === 'i') {
    // img
    const title = ele.title || "";
    const { url, width, height } = ele;
    tree = h("img", { src: url, alt: title, width, height });
  } else {
    // text
    if (!ele.text) return;
    tree = t(ele.text);
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
    tree = cls(tree, `text-${mapColor(ele.tc, 600, config.colorMap)}`);
  }
  if (ele.h) {
    // highlight color, can be number (1, 2, 3) or hex string (#ff0000)
    tree = cls(tree, `bg-${mapColor(ele.h, 300,  config.colorMap)}`);
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
