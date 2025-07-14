import { type Child, h } from "hastscript";

import { cls, m, t, mapColor, wrapElementChildren } from "./item.js";
import { groupChildren } from "./ordered.js";
import { datanames } from "./util.js";
import { toHtml } from "hast-util-to-html";
import { DEFAULT_CONFIG } from "./const.js";
export { DEFAULT_CONFIG } from "./const.js";
export type HastNode = ReturnType<typeof h>;

/** Helper function for debug */
export function printDoc(doc: TDoc, depth = 0) {
  // @ts-ignore
  if (doc.val.key.at(0)?.i === "i") {
    // remove "blocks" from it
    doc.val.key.at(0)["blocks"] = undefined;
    doc.val.key.at(0)["textData"] = undefined;
  }
  if (doc.val.value["i"] === "i") {
    // remove "blocks" from it
    doc.val.value["blocks"] = undefined;
    doc.val.value["textData"] = undefined;
  }
  const res = doc.val.value ? doc.val.key.concat(doc.val.value) : doc.val.key;
  console.debug(stringTimes("= ", depth), JSON.stringify(res));

  for (const child of doc.ch) {
    printDoc(child, depth + 1);
  }
}

const stringTimes = (str: string, n: number) => Array(n).fill(str).join("");

/** Internal use only */
type DocTree = Map<DocId, TDoc>;

export function parseRems(workspace: Workspace): [TDoc, DocMap] {
  /** Middle result. Only return root node */
  const docTree: DocTree = new Map();
  /** Plain doc map */
  const docMap: DocMap = new Map();
  const docs = workspace.docs;
  const typeMap = new Map();
  for (const doc of docs) {
    const id = doc._id;
    docMap.set(id, doc);
  }
  docTree.set(workspace.documentRemToExportId, {
    val: docMap.get(workspace.documentRemToExportId),
    ch: [],
  });
  for (const doc of docs) {
    const id = doc._id;
    if (doc.parent) {
      const docObj = docTree.get(id);
      if (docObj) {
        docObj.val = doc;
      } else {
        docTree.set(id, {
          val: doc,
          ch: [],
        });
      }

      const thisDoc = docTree.get(id);

      const parent = docTree.get(doc.parent);
      if (parent) {
        parent.ch.push(thisDoc);
      } else {
        docTree.set(doc.parent, {
          val: undefined,
          ch: [thisDoc],
        });
      }
    } else {
      // console.log(`No parent for ${id}: ${doc.key}`);
      typeMap.set(doc.key.at(0), doc);
    }
  }

  const root = docTree.get(workspace.documentRemToExportId);
  if (!root) {
    throw new Error(`No root document with id ${workspace.documentRemToExportId}`);
  }

  return [root, docMap];
}

export function transformDoc(
  tdoc: TDoc,
  ctx: Context,
  level = 0
): HastNode | undefined {
  const { config } = ctx;
  if (config.docHook) {
    const _tdoc = config.docHook(tdoc, level);
    tdoc = _tdoc;
  }
  const doc = tdoc.val;
  if (!doc?.key || (doc?.key.length === 1 && doc.key.at(0)["i"] === "q") || (doc?.key.length === 2 && doc.key.at(1)["i"] === "q")) {
    // the first element is "contains:" or "query:" when length === 2
    return;
  }
  const { key, value, _id } = doc;

  if (doc.crt?.cd?.l) {
    // code block
    const cd = doc.crt.cd;
    let lang = cd.l?.s;
    if (lang === "No Language") lang = "text";
    const code = h("code", { class: `language-${lang}` },
      t(key.at(0) as string)
    );
    const pre = h("pre", code);
    return pre;
  }

  let front: Child[] = [];
  let back: Child[] = [];

  if (key)
    front = key.map((e) => m(e, ctx)).filter((x) => x !== undefined);
  if (value)
    back = value.map((e) => m(e, ctx)).filter((x) => x !== undefined);

  const children = (tdoc.ch)
    .map((x) => transformDoc(x, ctx, level + 1))
    .filter(Boolean);
  let thisCard =
    back?.length > 0
      ? front.concat(
        [h("span", { class: "card-arrow" }, doc.enableBackSR ? "←" : "→")],
        back
      )
      : front.concat(
        // biome-ignore lint/complexity/useLiteralKeys: may be undefined
        doc["forget"] !== undefined
          ? [h("span", { class: "card-arrow" }, "↓")]
          : []
      );

  if (!thisCard.length) return undefined;

  const thisProps = {
    id: _id,
  };
  if (config.debug) {
    Object.defineProperty(thisProps, "title", {
      value: JSON.stringify(doc),
      enumerable: true,
      writable: false,
    });
  }

  const data: Record<string, string | boolean> =
    "crt" in doc && doc.crt
      ? {
        ordered: Boolean(doc.crt.i),
        answer: Boolean(doc.crt.a),
        folder: Boolean(doc.crt?.o?.f),
      }
      : {};
  let tag = "div";
  // @ts-ignore
  if (doc.crt) {
    const crt = doc.crt as Crt;
    if (crt?.r?.s?.s.startsWith("H")) {
      const lv = crt.r.s.s.slice(1);
      tag = `h${Number.parseInt(lv) + 1}`;
    }
    if (crt.im?.i?.v?.length) { // right side img
      const { width, height } = crt.im.i.v[0];
      const tree = h("img.float-end.inline-block", {
        src: crt.im.i.s,
        width,
        height,
      });
      thisCard.unshift(tree);
    }
    if (doc.crt.qt) {
      tag = "blockquote";
    }
  }

  let node: HastNode;
  let firstBlock: Child;

  if (!children.length) {
    node = h(tag, thisProps, ...thisCard);
    firstBlock = node;
  } else {
    const groupedChildren = groupChildren(children);
    if (level === 0 && config.unwrapRoot) {
      node = h(tag, thisProps, ...thisCard, ...groupedChildren);
      firstBlock = thisCard[0];
    }
    else {
      config.debug &&
        groupedChildren.length > 1 &&
        console.log("Grouped children", groupedChildren);
      if (tag !== "div") thisCard = [h(tag, {
        class: "inline-block"
      }, ...thisCard)];
      firstBlock = h("summary", thisProps, ...thisCard);
      node = h("details", { open: !doc.ic || level < config.openLevel }, [
        firstBlock,
        ...groupedChildren,
      ]);
    }
  }
  if (doc.crt?.h?.c?.s && thisCard.length > 0 /* TODO */) { // add bg color
    cls(firstBlock, `bg-${mapColor(doc.crt?.h?.c?.s, 300, config.colorMap)}`, true);
  }
  if (doc.crt?.clo) {
    //   let firstBlockE = firstBlock as Element;
    //   if (firstBlockE.tagName !== "div") throw new Error("First block is not div");
    //   // @ts-ignore
    //   firstBlockE.tagName = "blockquote"
    //   console.debug(firstBlockE)
    //   cls(firstBlock, "callout")

    const properties = { class: "callout", }
    const icon = doc.crt.clo.b.s;
    if (config.noCss === false) {
      properties["data-callout-icon"] = icon;
    } else {
      node.children.unshift(h("span", { class: "callout-icon" }, icon));
    }

    // @ts-ignore
    wrapElementChildren(node, "blockquote", properties);
  }
  if (typeof doc.docUpdated === "number") data.document = true;
  return datanames(node, data);
}

export function hydrate(workspace: Workspace) {
  const [root, docMap] = parseRems(workspace);
  function simplify(x: TDoc) {
    // delete all "***,u" keys from x.val
    if (!x.val) {
      return false;
    }
    if (x.val.portalsIn) return false;
    for (const key in x.val) {
      if (/^k,|,[ou]$/.test(key)) {
        delete x.val[key];
      }
    }
    delete x.val.createdAt;
    delete x.val.owner;
    delete x.val.k;
    if ("f" in x.val) {
      delete x.val.f;
    }
    x.ch = x.ch.map(simplify).filter(Boolean) as TDoc[];
    return x;
  }
  return simplify(root);
}

export function rem2Hast(workspace: Workspace, config = DEFAULT_CONFIG) {
  const [root, docMap] = parseRems(workspace);
  const hRoot = transformDoc(root, { config, docMap });
  if (hRoot.tagName === "details") hRoot.properties.open = true;
  return hRoot;
}

export function rem2Html(workspace: Workspace, config = DEFAULT_CONFIG) {
  const hTree = rem2Hast(workspace, config);
  return toHtml(hTree);
}

/** Generate a plain doc map from a hydrated docTree */
function hydrate2DocMap(hydrated: TDoc) {
  const docMap = new Map();
  function walk(x: TDoc) {
    docMap.set(x.val._id, x);
    x.ch.forEach(walk);
  }
  walk(hydrated);
  return docMap;
}

/** @deprecated only compatible with 0.2.x hydration */
export function hydrate2Html(hydrated: TDoc, config = DEFAULT_CONFIG) {
  const docMap = hydrate2DocMap(hydrated);
  const hTree = transformDoc(hydrated, { config, docMap });
  return toHtml(hTree);
}
