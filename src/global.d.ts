type DocId = string;

type BaseEle = { // RemNote rich text segment
    text?: string;
    /**
     * i: math
     */
    i?: "i" | "q" | "m" | "x";
    b?: boolean;
    l?: boolean;
    u?: boolean;
    tc?: string | number;
    h?: string | number;
    url?: string;
    width?: number;
    height?: number;
    /** cloze id */
    cId?: string;
    qId?: string;
} | string;

type ImageSet = {
    title?: string;
    width: number;
    height: number;
    url: string;
};

type MathSet = {
    /** block or inline */
    block: boolean;
    /** for `c1`, `c2`, ... */
    latexClozes: number[];
}

type RemTypes = "Daily Document"
    | "Document"
    | "Automatically Sort"
    | "Tags"
    | "Template Slot"
    | "Header"
    | "Website"
    | "Link"
    | "Quote"
    | "Image"
    | "Code"
    | "Card Item"
    | "List Item"

type TypeDoc = {
    key: [RemTypes],
    typeChildren: DocId[] | never[],
    parent: null,
}

type Ele = AllOrNones<BaseEle, [ImageSet, MathSet]>;

type NoneOf<S> = { [K in keyof S]?: never };

type AllOrNone<B, S> = B & S | B & NoneOf<S>;

type ExpandToAllOrNoneHelper<T, U> = U extends [infer F, ...infer R]
    ? ExpandToAllOrNoneHelper<AllOrNone<T, F>, R>
    : T;

type AllOrNones<T, U extends any[]> = ExpandToAllOrNoneHelper<T, U>;

type Doc = ({
    key: Ele[];
    value?: Ele[];
    _id: DocId;
} | TypeDoc) & {
    m?: number;
    createdAt: number;
    v: number;
    parent: DocId;
    n: number;
    rcrt: string;
    x?: number;
    y?: number;
    z?: number;
    owner: string;
    e: string;
    u: number;
    k: string;
    /** AI generated card prompt */
    ai?: any;
    ic?: boolean;
    di: DocId[];
    ch: Doc[];
    kr: any[];
    vr: any[];
};
