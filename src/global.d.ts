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
    crt?: {
        /** Ordered List item */
        i?: {};
        /** Card item */
        w?: {};
        /** Quoteblock */
        qt?: {};
        r?: {
            s: any;
        }
        /** Link? */
        a?: {};
        /** Link? */
        z?: {};
        b?: {
            u?: any;
        }
        /** Document */
        o?: {
            s?: any;
        }
    } | null;
    "crt,u"?: number;
    "crt,o"?: number;
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
    rcrt: string,
    "rcrt,u": number,
    crt?: {
        /** Automatically Sort */
        g?: {},
        /** Daily Documents */
        o?: {
            s?: any;
        }
    }
}

type Ele = AllOrNones<BaseEle, [ImageSet, MathSet]>;

type NoneOf<S> = { [K in keyof S]?: never };

type AllOrNone<B, S> = B & S | B & NoneOf<S>;

type ExpandToAllOrNoneHelper<T, U> = U extends [infer F, ...infer R]
    ? ExpandToAllOrNoneHelper<AllOrNone<T, F>, R>
    : T;

type AllOrNones<T, U extends any[]> = ExpandToAllOrNoneHelper<T, U>;

type Workspace = {
    userId: string;
    knowledgebaseId: string;
    name: string;
    exportDate: string;
    exportVersion: number;
    documentRemToExportId: string;
    docs: Doc[];
}

type Doc = ({
    value?: Ele[];
    _id: DocId;
} | TypeDoc) & {
    m: number;
    key: Ele[];
    "key,u"?: number;
    createdAt: number;
    enableBackSR?: boolean;
    "enableBackSR,u"?: number;
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
    ai?: {
        def: string;
        lines: string[];
    };
    "ai,u"?: number;
    ic?: boolean;
    di: DocId[];
    ch: Doc[];
    kr: any[];
    vr: any[];
};
