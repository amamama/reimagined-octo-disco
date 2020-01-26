import romajiTable from '@/assets/ro.json';

export default class HiraKataConverter {
    public static hirakata(str: string): string {
        return HiraKataConverter.genConverter(HiraKataConverter.hira, HiraKataConverter.kata)(str);
    }
    public static katahira(str: string): string {
        return HiraKataConverter.genConverter(HiraKataConverter.kata, HiraKataConverter.hira)(str);
    }
    public static romahira(str: string): string {
        let ret: string = '';
        while(str.length) {
            const table = romajiTable.find((({from}) => str.startsWith(from)));
            if(!table) {
                ret += HiraKataConverter.hira.includes(str[0]) ? str[0] : '';
                str = str.slice(1);
                continue;
            }
            ret += table.to;
            str = str.slice(table.from.length);
            str = table.pushStr + str;
        }

        return ret;
    }
    private static hira: string[]
        = (new Array(96))
        .fill(0x3040)
        .map((n, i) => String.fromCodePoint(n + i));
    private static kata: string[]
        = (new Array(96))
        .fill(0x30A0)
        .map((n, i) => String.fromCodePoint(n + i));
    private static genConverter(from: string[], to: string[]) {
        return (str: string): string => {
            return Array.from(str).map((s) => {
                const index = from.indexOf(s);
                return index < 0 ? s : to[index];
            }).join('');
        };
    }
}
