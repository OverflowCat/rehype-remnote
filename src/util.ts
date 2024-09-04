import type { h } from "hastscript";
type HastNode = ReturnType<typeof h>;

export function datanames(node: HastNode, datas: Array<string> | Record<string, string | boolean | undefined>): HastNode {
    if (Array.isArray(datas)) {
      for (const data of datas)
        node.properties[`data-${data}`] = "";
    } else {
      for (let [key, value] of Object.entries(datas)) {
        if (typeof value === "boolean") {
          value = value ? "" : undefined;
        }
        if (value !== undefined) {
          node.properties[`data-${key}`] = value;
        }
      }
    }
    return node;
  }
