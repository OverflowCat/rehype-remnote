import { h } from "hastscript";
import { wrap } from "./item.js";
type HastNode = ReturnType<typeof h>;

export function groupChildren(children: HastNode[]): HastNode[] {
    const groups = groupAdjacent(children, x => typeof (x.properties['data-ordered']) === "string");
    return groups.map(([isOrdered, children]) => {
        if (isOrdered) {
            return h('ol', children.map(x => wrap(x, 'li')));
        }
        return h('ul', children.map(x => wrap(x, 'li')));
    });
}

function groupAdjacent<T, V>(arr: T[], keyFn: (x: T) => V)
    : [V, T[]][] {
    /**
     * Groups adjacent elements in an array by a key function.
     *
     * eg. [1, 3, 5, 6, 8, 9], x => x % 2
     * returns [[1, [1, 3, 5]], [0, [6, 8]], [1, [9]]]
     */
    const groups = [];
    let lastKey = undefined;
    let group = [];
    for (const x of arr) {
        const key = keyFn(x);
        if (key !== lastKey) {
            if (group.length) {
                groups.push([lastKey, group]);
                group = [];
            }
            lastKey = key;
        }
        group.push(x);
    }
    if (group.length) groups.push([lastKey, group]);
    return groups;
}
