export default class Number64 {
    public static from(n: number): string {
        let ret: string = '';
        do {
            ret = Number64.digit[n % 64] + ret;
            n = Math.floor(n / 64);
        } while(n);
        return ret;
    }
    public static to(repr: string): number {
        let ret: number = 0;
        do {
            ret = ret * 64 + Number64.digit.indexOf(repr[0]);
            repr = repr.slice(1);
        } while(repr.length > 0);
        return ret;
    }

    private static cpAtoZ: number[] = (new Array(26)).fill(0x41).map((n, i) => n + i);
    private static cp0to9: number[] = (new Array(10)).fill(0x30).map((n, i) => n + i);
    private static cphd: number[] = [0x2d, 0x2e]; //["-", "."]
    private static cpAtoDot: number[] =
        Number64.cpAtoZ
            .concat(Number64.cpAtoZ.map((cp) => cp + 0x20))
            .concat(Number64.cp0to9)
            .concat(Number64.cphd);
    private static digit: string = String.fromCodePoint(...Number64.cpAtoDot);
    private repr: string;
    constructor(n: number) {
        this.repr = Number64.from(n);
    }

    get number(): number {
        return Number64.to(this.repr);
    }

    set number(n: number) {
        this.repr = Number64.from(n);
    }

    public toString(): string {
        return this.repr;
    }
}

