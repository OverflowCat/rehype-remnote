type DocId = string;

type VsPair<T> = {
    id: string;
    v: T[];
    s: T;
}

type ColorStr = string;

type LinkTitle = string;

type CCallout = {
    b: VsPair<string>
}

type RightSideImage = {
    i: {
        _id: string;
        v: {
            i: "i";
            width: number;
            height: number;
            /** URL */
            s: string;
        }[];
        s: string;
    }
}

type Crt = {
    /** Ordered List item */
    i?: Record<string, never>;
    /** Card item */
    w?: Record<string, never>;
    /** Quoteblock */
    qt?: Record<string, never>;
    im?: RightSideImage;
    h?: {
        /** Highlight color */
        c?: {
            _id: string;
            v: {
                i: "q";
                _id: string;
            }[];
            /** @example "Blue" */
            s: ColorStr;
        }
    }
    clo?: CCallout
    r?: {
        s: {
            _id: string;
            v: { i: string, _id: string }[];
            s: string; // "H1"
        }
    }
    /** code */
    cd?: {
        /** language */
        l?: {
            v: string[];
            s: string;
        }
    };
    /** Link? */
    a?: {};
    /** Link? */
    z?: {};
    /** Link element */
    b?: {
        /** Link target */
        u?: VsPair<LinkTitle>;
        /** Link title */
        t?: VsPair<string>;
    }
    /** Document */
    o?: {
        s?: any;
        /** Folder */
        f?: VsPair<"true">;
        /** Folder icon */
        b?: VsPair<string>;
    }
}

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
    rcrt: string,
    "rcrt,u": number,
    crt?: {
        /** Automatically Sort */
        g?: Record<string, never>,
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

type CardState = "New" | "Acquiring" | "Growing" | "Solidifying" | "Retaining" | "Stale";

type Doc = ({
    value?: Ele[];
    _id: DocId;
} | TypeDoc) & {
    crt?: Crt | null;
    "crt,u"?: number;
    "crt,o"?: number;
    folderOpen?: boolean,
    "folderOpen,u"?: number,
    "dm": Record<CardState, number>,
    m: number;
    key: Ele[];
    "key,u"?: number;
    /** Only Doc has these */
    docUpdated?: number;
    "docUpdated,u": number;
    "docUpdated,o": number;
    createdAt: number;
    enableBackSR?: boolean;
    "enableBackSR,u"?: number;
    /** Portal doc */
    portalsIn?: any;
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
    ic?: boolean; // open
    di: DocId[];
    ch: Doc[];
    kr: any[];
    vr: any[];
};

type TDoc = {
    val: Doc;
    ch: TDoc[];
};

type DocMap = Map<DocId, Doc>;

type XformConfig = {
    openLevel: number,
    unwrapRoot?: boolean,
    colorMap: string[],
    debug?: boolean,
    docHook?: (tdoc: TDoc, level: number) => TDoc,
    noCss?: boolean,
}

type Context = {
    config: XformConfig
    /** all docs in the workspace */
    docMap: DocMap
}

/** In hAST Node */
// type Properties = Record<string, string | undefined | boolean | number | BigInt>
