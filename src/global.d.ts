type DocId = string;

type Crt = {
    /** Ordered List item */
    i?: {};
    /** Card item */
    w?: {};
    /** Quoteblock */
    qt?: {};
    /** Right side Image */
    im?: {
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
        /** Folder */
        f?: {
            _id?: any;
            s?: "true";
            v?: "true"[];
        };
        b?: {
            _id?: any;
            /** Folder icon src */
            s?: string;
            /** Folder icon src array */
            v?: string[];
        }
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
    ic?: boolean;
    di: DocId[];
    ch: Doc[];
    kr: any[];
    vr: any[];
};

type TDoc = {
    val: Doc;
    ch: TDoc[];
};

type DocMap = Map<DocId, TDoc>;

type XformConfig = {
    openLevel: number,
    colorMap: string[],
    debug?: boolean,
    docHook?: (tdoc: TDoc, level: number) => TDoc,
}
