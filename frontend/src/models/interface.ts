
export interface Pairee {
    id: number;
    name: string;
}

export interface Lane {
    id: number;
    name: string
}

export interface Pair {
    pairee1: Pairee;
    pairee2?: Pairee;
    lane: Lane;
}

export interface Assignment {
    pairs: Pair[];
    date: Date;
}
