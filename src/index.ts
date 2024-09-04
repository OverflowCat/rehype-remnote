import { toHtml } from 'hast-util-to-html'
import { h } from "hastscript";
import {
  /// @type {Workspace}
  workspace
} from "../rem.js";

type TDoc = {
  val: Doc;
  ch: TDoc[];
};

const docMap = new Map<DocId, TDoc>();
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
  let thisDoc = docMap.get(id);

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

const stringTimes = (str: string, n: number) => Array(n).fill(str).join("");

export function printDoc(doc: TDoc, depth = 0) {
  const node = h("")
  if (doc.val.key.at(0)['i'] === "i") {
    // remove "blocks" from it
    doc.val.key.at(0)['blocks'] = undefined;
    doc.val.key.at(0)['textData'] = undefined;
  }
  if (doc.val.value['i'] === "i") {
    // remove "blocks" from it
    doc.val.value['blocks'] = undefined;
    doc.val.value['textData'] = undefined;
  }
  const res = doc.val.value ? doc.val.key.concat(doc.val.value) : doc.val.key;
  console.log(stringTimes("= ", depth), JSON.stringify(res));

  for (const child of doc.ch) {
    printDoc(child, depth + 1);
  }
}

const listIds = new Set(
  typeMap.get("List Item")?.typeChildren || []
);

import { m } from "./item.js";
import { groupChildren } from './ordered.js';
import { datanames } from './util.js';
type HastNode = ReturnType<typeof h>;

export function transformDoc(tdoc: TDoc): HastNode | undefined {
  const doc = tdoc.val;
  if (!doc?.key || doc?.key.length === 1 && doc.key.at(0)['i'] === 'q') {
    // console.log("Skipping", tdoc);
    return;
  }
  const { key, value, _id } = doc;
  let front = [], back = [];
  if (key)
    front = key.map(m).filter((x: any) => x !== undefined);
  if (value)
    back = value.map(m).filter((x: any) => x !== undefined);

  const children = (doc.ch as Array<any>).map(x => docMap.get(x)).map(transformDoc).filter(Boolean);
  const thisCard = back?.length > 0 ? front.concat(
    [h('span', { class: "card-arrow" }, doc.enableBackSR ? "←" : "→")], back
  ) : front.concat(doc['forget'] !== undefined ? [h('span', { class: "card-arrow" }, "↓")] : []);

  if (!thisCard.length) return undefined;

  const thisProps = {
    id: _id,
    // title: JSON.stringify(doc)
  };
  const data = "crt" in doc && doc.crt ? {
    "ordered": Boolean(doc.crt['i']),
    "answer": Boolean(doc.crt['a']),
  } : {};
  console.log("Data", data);
  if (!children.length) {
    var node = h('div', thisProps, thisCard);
  } else {
    const groupedChildren = groupChildren(children);
    groupedChildren.length > 1 && console.log("Grouped children", groupedChildren);
    var node = h('details', { open: true }, [
      h('summary', thisProps, thisCard),
      ...groupedChildren,
    ]);
  }
  return datanames(node, data);
}

export function render() {
  const hTree = transformDoc(root);
  return toHtml(hTree);
}

console.log(render());
