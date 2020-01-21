<template>
    <v-data-table
        :headers="headers"
        :hide-default-header="true"
        :items="items"
        item-key="pokemon"
        sort-by="pokemon"
        :search="search"
    >
        <template v-slot:top>
            <v-toolbar flat>
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
                {{ text }}
                <v-spacer></v-spacer>
                <template v-if="!registering">
                    <v-btn @click="registering = true">
                        new face
                    </v-btn>
                    <v-btn disabled>cancel</v-btn>
                </template>
                <template v-else>
                    <v-btn @click="registerPokemon">
                        register
                    </v-btn>
                    <v-btn @click="cancel">
                        cancel
                    </v-btn>
                </template>
            </v-toolbar>
            <v-divider></v-divider>
        </template>
        <template v-slot:header="{props: { headers, mobile }}">
            <thead>
                <tr>
                    <th v-for="header of headers" :key="header.value" :class="header.value">
                        <ball-img v-if="isBall(header)"
                            :kind="header.value"
                        ></ball-img>
                        <template v-else>
                            {{ header.text }}
                        </template>
                    </th>
                </tr>
            </thead>
        </template>
        <template v-slot:body.prepend="{headers}" v-if="registering">
            <tr>
                <td
                    v-for="header of headers"
                    :key="header.value"
                    :class="header.value"
                    @click="isBall(header) && (newFace.ballSet[header.value] = !newFace.ballSet[header.value])"
                >
                    <v-autocomplete
                        v-if="header.value == 'pokemon'"
                        :items="pokemonList"
                        :filter="pokemonFilter"
                        item-text="pokemon.name"
                        return-object
                        @input="updateNewFace"
                    ></v-autocomplete>
                    <ball-img v-else-if="newFace.ballSet[header.value]" :kind="header.value"></ball-img>
                </td>
            </tr>
        </template>
        <template v-slot:item="item">
            <tr>
                <td
                    v-for="header of item.headers"
                    :key="header.value"
                    :class="header.value"
                    @click="isBall(header) && (item.item.ballSet[header.value] = !item.item.ballSet[header.value])"
                >
                    <template v-if="!isBall(header)">
                        <template v-if="header.value === 'number'">
                            {{ item.item.pokemonId }}
                        </template>
                        <template v-else-if="header.value === 'pokemon'">
                            {{ item.item.pokemon }}
                        </template>
                        <template v-else-if="header.value === 'ability'">
                            {{ getHiddenAbility(item.item.pokemon) }}
                        </template>
                    </template>
                    <ball-img v-else-if="item.item.ballSet[header.value]" :kind="header.value"></ball-img>
                </td>
            </tr>
        </template>
        <template v-slot:footer="">
            {{ debug }}
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {DataTableHeader} from 'vuetify';
import BallImage from '@/components/BallImage.vue';
import pokemonList from '@/assets/po.json';

interface BallSet {
    love: boolean;
    moon: boolean;
    heavy: boolean;
    level: boolean;
    friend: boolean;
    fast: boolean;
    lure: boolean;
    dream: boolean;
    beast: boolean;
    [key: string]: boolean;

}

interface PokemonTableElement {
    pokemonId: number;
    pokemon: string;
    hiddenAbility: boolean[];
    ballSet: BallSet;
    needAllBall: number; // 0 | 1 | 2 | 3; // 性別不明 | オスのみ | メスのみ | 両方
}


interface PokemonTableHeader extends DataTableHeader {
    text: string;
    value: string;
}

const Balls: Array<keyof BallSet> = [
    'love',
    'moon',
    'heavy',
    'level',
    'friend',
    'fast',
    'lure',
    'dream',
    'beast',
];

class Number64 {
    public static from(n: number): string {
        let ret: string = '';
        do {
            ret = Number64.digit[n % 64] + ret;
            n = n / 64 | 0;
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
    private static cp0toSemicolon: number[] = (new Array(12)).fill(0x30).map((n, i) => n + i);
    private static cpAtoSemicolon: number[] =
        Number64.cpAtoZ
        .concat((Number64.cpAtoZ.map((cp) => cp + 0x20))
        .concat(Number64.cp0toSemicolon));
    private static digit: string = String.fromCodePoint(...Number64.cpAtoSemicolon);
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

@Component({
    components: {
        'ball-img': BallImage,
    },
})
export default class PokemonTable extends Vue {
    private text: string = '';
    private debug: string = '';
    private pokemonList = pokemonList;
    private search: string = '';
    private registering: boolean = false;
    private newFace: PokemonTableElement = this.resetPokemonTableElement();
    private items: PokemonTableElement[] = [];
    private headers: PokemonTableHeader[] = [
        {text: 'No', value: 'number'},
        {text: 'ポケモン', value: 'pokemon'},
        {text: '隠れ特性', value: 'ability'},
        {text: 'ラブラブボール', value: 'love'},
        {text: 'ムーンボール', value: 'moon'},
        {text: 'ヘビーボール', value: 'heavy'},
        {text: 'レベルボール', value: 'level'},
        {text: 'フレンドボール', value: 'friend'},
        {text: 'スピードボール', value: 'fast'},
        {text: 'ルアーボール', value: 'lure'},
        {text: 'ドリームボール', value: 'dream'},
        {text: 'ウルトラボール', value: 'beast'},
    ];
    private pokemonFilter(item: any, queryText: string, itemText: string): boolean {
        return item.pokemon.name.includes(queryText);
    }
    private searchPokemon(poke: any) {
        return poke.pokemon.name;
    }
    private isBall(header: PokemonTableHeader): boolean {
        return Balls.includes(header.value);
    }
    private findPokemon(name: string) {
        const pokemon = this.pokemonList.find((p) => p.pokemon.name === name);
        if(!pokemon) { throw new Error(`nanka okasii :${name}: `); }
        return pokemon;
    }
    private getHiddenAbility(name: string): string {
        const pokemon = this.findPokemon(name);
        if(pokemon.abilities.hiddenAbility.length === 0) { return '---'; }
        return pokemon.abilities.hiddenAbility[0];
    }
    private resetPokemonTableElement(): PokemonTableElement {
        return {
            pokemonId: 0,
            pokemon: '',
            hiddenAbility: [],
            needAllBall: 3,
            ballSet: {
                love: false,
                moon: false,
                heavy: false,
                level: false,
                friend: false,
                fast: false,
                lure: false,
                dream: false,
                beast: false,
            },
        };
    }
    private havePokemon(name: string): PokemonTableElement | undefined {
        return this.items.find((item) => item.pokemon === name);
    }
    private updateNewFace(p: any) {
        const oldFace = this.havePokemon(p.pokemon.name);
        if(oldFace) {
            this.newFace = oldFace;
        } else {
            this.newFace.pokemon = p.pokemon.name;
            this.newFace.pokemonId = p.number;
        }
    }
    private resetRegisterState() {
        this.registering = false;
        this.newFace = this.resetPokemonTableElement();
    }
    private updatePokemon() {
        const index: number = this.items.findIndex((p) => p.pokemon === this.newFace.pokemon);
        this.items.splice(index, 1, this.newFace);
    }
    private registerPokemon() {
        if(!this.pokemonList.find((p) => p.pokemon.name === this.newFace.pokemon)) { return this.cancel(); }
        if(this.havePokemon(this.newFace.pokemon)) { this.updatePokemon(); }
        else { this.items.push(this.newFace); }
        this.exportItems();
        this.resetRegisterState();
    }
    private cancel() {
        this.resetRegisterState();
    }

    private exportItems() {
        function encodeBallAndAbility(item: PokemonTableElement): number {
            function toD3(prop: boolean, i: number, arr: boolean[]): number {
                return prop ? arr[i] ? 2 : 1 : 0;
            }
            return (Balls
                .map((b, i) => toD3(item.ballSet[b], i, item.hiddenAbility))
                .reduce(((a, v) => a * 3 + v), 0));
        }
        const d = this.items.map((item) => (item.needAllBall * 512 + item.pokemonId) * 65536 + encodeBallAndAbility(item));
        const encoded = d.map((n) => (new Number64(n)).toString()).join('');
        this.debug = encoded;
        localStorage.setItem('table', encoded);
    }
    private importItems(encoded: string) {
        if(encoded.length % 5 !== 0) { return; }
        const encodedArr: string[] = [];
        for(; encoded.length > 0; encoded = encoded.slice(5)) {
            encodedArr.push(encoded.slice(0, 5));
        }
        const decodedArr: number[] = encodedArr.map((s) => Number64.to(s));
        this.items = decodedArr.map((n) => {
            const ret: PokemonTableElement = this.resetPokemonTableElement();
            const need = (n / (65536 * 512) | 0) % 4;
            const num = ((n / 65536) | 0) % 512;
            const pokemon = this.pokemonList.find((p) => p.number === num);
            if(!pokemon) { throw new Error(`import dekinai ${num}`); }
            const name = pokemon.pokemon.name;
            ret.hiddenAbility.fill(false);
            n %= 65536;
            ret.pokemonId = num;
            ret.pokemon = name;
            ret.needAllBall = need;
            for(let i = Balls.length - 1; i > 0; i--) {
                const d = n % 3;
                ret.hiddenAbility[i] = d === 2;
                ret.ballSet[Balls[i]] = d > 0;
                n = n / 3 | 0;
            }
            return ret;
        });
    }
    public created() {
        if(!this.$route.query.table || typeof(this.$route.query.table) !== 'string') {
            const encodedFromLocalStorage = localStorage.getItem('table');
            if(encodedFromLocalStorage) { this.importItems(encodedFromLocalStorage); }
            return;
        }
        const encodedFromQuery: string = this.$route.query.table;
        this.importItems(encodedFromQuery);
    }
}
</script>

<style scoped>
    table, tr, td, th {border-collapse: collapse; border-color: aliceblue; }
    .number {max-width: 60px; width: 60px; min-width: 60px; }
    .pokemon {max-width: 180px; width: 180px; min-width: 180px; }
    .ability {max-width: 180px; width: 180px; min-width: 180px;}
    .love { background-color: rgba(255, 225, 255, 1); }
    .moon { background-color: rgba(236, 236, 255, 1); }
    .heavy { background-color: rgba(236, 236, 236, 1); }
    .level { background-color: rgba(255, 255, 216, 1); }
    .friend { background-color: rgba(216, 255, 216, 1); }
    .fast { background-color: rgba(255, 225, 225, 1); }
    .lure { background-color: rgba(225, 236, 255, 1); }
    .dream { background-color: rgba(255, 216, 255, 1); }
    .beast { background-color: rgba(216, 225, 255, 1); }
</style>
