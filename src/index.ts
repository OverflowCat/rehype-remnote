import { type Child, h } from "hastscript";

import { m } from "./item.js";
import { groupChildren } from "./ordered.js";
import { datanames } from "./util.js";
import { toHtml } from "hast-util-to-html";
export type HastNode = ReturnType<typeof h>;

/** Helper function for debug */
export function printDoc(doc: TDoc, depth = 0) {
  if (doc.val.key.at(0)["i"] === "i") {
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
  console.log(stringTimes("= ", depth), JSON.stringify(res));

  for (const child of doc.ch) {
    printDoc(child, depth + 1);
  }
}

const stringTimes = (str: string, n: number) => Array(n).fill(str).join("");

export function parseRems(workspace: Workspace): [TDoc, DocMap] {
  const docMap: DocMap = new Map();
  const docs = workspace.docs;
  const typeMap = new Map();
  for (const doc of docs) {
    const id = doc._id;
    const docObj = docMap.get(id);
    if (docObj) {
      docObj.val = doc;
    } else {
      docMap.set(id, {
        val: doc,
        ch: [],
      });
    }

    const thisDoc = docMap.get(id);

    if (doc.parent) {
      const parent = docMap.get(doc.parent);
      if (parent) {
        parent.ch.push(thisDoc);
      } else {
        docMap.set(doc.parent, {
          val: undefined,
          ch: [thisDoc],
        });
      }
    } else {
      // console.log(`No parent for ${id}: ${doc.key}`);
      typeMap.set(doc.key.at(0), doc);
    }
  }

  const root = docMap.get(workspace.documentRemToExportId)!;
  return [root, docMap];
}

export function transformDoc(
  tdoc: TDoc,
  docMap: DocMap,
  config: XformConfig,
  level = 0
): HastNode | undefined {
  if (config.docHook) {
    console.log('hook')
    const [_tdoc, _docMap] = config.docHook(tdoc, docMap, level);
    tdoc = _tdoc;
    docMap = _docMap;
  }
  const doc = tdoc.val;
  if (!doc?.key || (doc?.key.length === 1 && doc.key.at(0)["i"] === "q")) {
    return;
  }
  const { key, value, _id } = doc;
  let front: Child[] = [],
    back: Child[] = [];
  if (key)
    front = key.map((e) => m(e, config)).filter((x: any) => x !== undefined);
  if (value)
    back = value.map((e) => m(e, config)).filter((x: any) => x !== undefined);

  const children = (doc.ch as Array<any>)
    .map((x) => docMap.get(x))
    .filter(Boolean)
    .map((x) => transformDoc(x, docMap, config, level + 1))
    .filter(Boolean);
  const thisCard =
    back?.length > 0
      ? front.concat(
          [h("span", { class: "card-arrow" }, doc.enableBackSR ? "←" : "→")],
          back
        )
      : front.concat(
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
    })
  }

  const data: Record<string, string | boolean> =
    "crt" in doc && doc.crt
      ? {
          ordered: Boolean(doc.crt["i"]),
          answer: Boolean(doc.crt["a"]),
          folder: Boolean(doc.crt?.o?.f),
        }
      : {};
  // @ts-ignore
  if (doc.crt) {
    const crt = doc.crt as Crt;
    if (crt.im?.i.v.length) {
      const { width, height } = crt["im"].i.v[0];
      const tree = h("img.float-end.inline-block", {
        src: crt.im.i.s,
        width,
        height,
      });
      thisCard.unshift(tree);
    }
  }
  let node: HastNode;
  if (!children.length) {
    node = h("div", thisProps, ...thisCard);
  } else {
    const groupedChildren = groupChildren(children);
    config.debug && groupedChildren.length > 1 && console.log("Grouped children", groupedChildren);
    node = h("details", { open: !doc.ic || level < config.openLevel }, [
      h("summary", thisProps, ...thisCard),
      ...groupedChildren,
    ]);
  }
  if (typeof doc.docUpdated === "number") data.document = true;
  return datanames(node, data);
}

export const DEFAULT_CONFIG: XformConfig = {
  openLevel: 2,
  colorMap: ["current", "red", "orange", "yellow", "green", "indigo", "purple"],
  debug: false,
};

export function rem2Hast(workspace: Workspace, config = DEFAULT_CONFIG) {
  const root = transformDoc(...parseRems(workspace), config);
  if (root.tagName === "details") root.properties.open = true;
  return root;
}

export function rem2Html(workspace: Workspace, config = DEFAULT_CONFIG) {
  const hTree = rem2Hast(workspace);
  return toHtml(hTree);
}
