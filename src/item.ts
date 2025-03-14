import { classnames } from "hast-util-classnames";
import type { Child, Properties } from "hastscript";
import { h } from "hastscript";
import { DEFAULT_CONFIG } from "./const.js";

export const wrap = (element: Child, tagName: string) => h(tagName, {}, element);
export function wrapElementChildren(
  element: Child, tagName: string, properties: Properties,
  prepend: Child[] = [], append: Child[] = []
): Child {
  // @ts-expect-error
  console.log(element.children)
  // @ts-expect-error
  const innerElement = h(tagName, properties, element.children);
  // @ts-expect-error
  element.children = [...prepend, innerElement, ...append];
  return element;
}

/**
 * @description Add `className`s to a Node
 * @param className New class names to add
 * @param inplace Check if the Node is an Element. If not, throw an error
 * @returns the new Node or the original Node if it's not a text node
 */
export const cls = (element: Child, className: string, inplace = false) => {
  if (typeof element === "object" && ("type" in element) && element.type === "element")
    return classnames(element, className);
  if (inplace) throw new Error("Cannot add class to text node");
  return h("span", { class: className }, element);
}

// red, orange, yellow, green, indigo, purple
export function mapColor(color: string | number, saturation: number, map: string[]) {
  const m = map || DEFAULT_CONFIG.colorMap;
  if (typeof color === "number")
    return color === 0 ? map[color] : `${map[color]}-${saturation}`;
  return `[${color}]`
}

/** Make text */
export function t(text: string) {
  return { type: "text" as const, value: text };
}

export function m(ele: Ele, ctx: Context): Child | undefined {
  const { config, docMap } = ctx;
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
  } else if (ele.i === 'm') {
    // maybe url
    const { qId, text } = ele;
    const linkEle = docMap.get(qId);
    if (linkEle) {
      const href = linkEle?.crt.b.u?.s || `#q-${qId}`;
      const title = linkEle?.crt.b.t?.s;
      tree = h("a", { href, title }, text);
    }
  }

  if (!tree) {
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
    tree = cls(tree, `bg-${mapColor(ele.h, 300, config.colorMap)}`);
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
