import { type Child, h } from "hastscript";

import { m } from "./item.js";
import { groupChildren } from "./ordered.js";
import { datanames } from "./util.js";
import { toHtml } from "hast-util-to-html";
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

export function parseRems(workspace: Workspace): [TDoc, DocMap] {
  const docMap: DocMap = new Map();
  const docs = workspace.docs;
  const typeMap = new Map();
  for (const doc of docs) {
    const id = doc._id;
    if (doc.parent) {
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
  config: XformConfig,
  level = 0
): HastNode | undefined {
  if (config.docHook) {
    const _tdoc = config.docHook(tdoc, level);
    tdoc = _tdoc;
  }
  const doc = tdoc.val;
  if (!doc?.key || (doc?.key.length === 1 && doc.key.at(0)["i"] === "q")) {
    return;
  }
  const { key, value, _id } = doc;
  let front: Child[] = [];
  let back: Child[] = [];
  if (key)
    front = key.map((e) => m(e, config)).filter((x: any) => x !== undefined);
  if (value)
    back = value.map((e) => m(e, config)).filter((x: any) => x !== undefined);

  const children = (tdoc.ch)
    .map((x) => transformDoc(x, config, level + 1))
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
    });
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
    config.debug &&
      groupedChildren.length > 1 &&
      console.log("Grouped children", groupedChildren);
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

export function hydrate(workspace: Workspace) {
  const [root] = parseRems(workspace);
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
  const [root,] = parseRems(workspace);
  const hRoot = transformDoc(root, config);
  if (hRoot.tagName === "details") hRoot.properties.open = true;
  return hRoot;
}

export function rem2Html(workspace: Workspace, config = DEFAULT_CONFIG) {
  const hTree = rem2Hast(workspace);
  return toHtml(hTree);
}

export function hydrate2Html(hydrated: TDoc, config = DEFAULT_CONFIG) {
  const hTree = transformDoc(hydrated, config);
  return toHtml(hTree);
}
