import { toHtml } from 'hast-util-to-html'
import { h } from "hastscript";

const docMap = new Map();
import { workspace } from "../rem.js";
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

const root = docMap.get(workspace.documentRemToExportId);

const stringTimes = (str: string, n: number) => Array(n).fill(str).join("");

export function printDoc(doc, depth = 0) {
  const node = h("")
  if (doc.val.key.at(0)?.i === "i") {
    // remove "blocks" from it
    doc.val.key.at(0).blocks = undefined;
    doc.val.key.at(0).textData = undefined;
  }
  if (doc.val.value?.i === "i") {
    // remove "blocks" from it
    doc.val.value.blocks = undefined;
    doc.val.value.textData = undefined;
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

import { m, wrap } from "./item.js";

type HastNode = ReturnType<typeof h>;

export function transformDoc(doc: any): HastNode | undefined {
  const { key, value, _id } = doc.val;
  let front = [], back = [];
  if (!key || key.length === 1 && key.at(0).i === 'q') {
    return;
  }
  if (key)
    front = key.map(m).filter((x: any) => x !== undefined);
  if (value)
    back = value.map(m).filter((x: any) => x !== undefined);

  const children = (doc.ch as Array<any>).map(transformDoc).filter(Boolean);
  const thisCard = back?.length > 0 ? front.concat(
    [h('span', { class: "card-arrow" }, "→")], back
  ) : front;
  const thisProps = { id: _id, title: JSON.stringify(doc) };
  if (children && children.length > 0) {
    const filtered = children.filter(c => listIds.has(c.properties.id));
    const listTag = filtered.length > 0 ? "ol" : 'ul';
    return h('details', { open: true }, [
      h('summary', thisProps, thisCard),
      h(listTag, children.map(x => wrap(x, "li")))
    ]);
  }
  if (!thisCard.length) return undefined;
  return h('div', thisProps, thisCard);
}

export function render() {
  const hTree = transformDoc(root);
  return toHtml(hTree);
}

// console.log(render());
