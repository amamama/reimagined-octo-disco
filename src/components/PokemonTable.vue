<template>
    <v-data-table
        :headers="headers"
        :hide-default-header="true"
        :items="items"
        item-key="pokemon"
        :custom-filter="(value, search, item) => (search === null || prettyfilter(item.pokemon, search))"
        :sort-by="sortBy"
        :sort-desc="sortDesc"
        :search="search"
        :footer-props="{'items-per-page-options': [10, 15, 30, -1]}"
        multi-sort
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
                    <th v-for="header of headers"
                        :key="header.value"
                        :class="`${header.value} px-2`"
                        @click="manageSortBy(header.value)">
                        <ball-img v-if="isBall(header.value)"
                            :kind="header.value"
                        ></ball-img>
                        <template v-else>
                            {{ header.text }}
                        </template>
                        <template v-if="isSorted(header.value) >= 0">
                            <v-icon small>
                                {{ 'mdi-' + (isDesc(header.value) ? 'chevron-down' : 'chevron-up') }}
                            </v-icon>
                            <v-icon small>
                                {{ 'mdi-' + `numeric-${(isSorted(header.value) + 1).toString()}-box-outline` }}
                            </v-icon>
                        </template>
                        <template v-else>
                            <v-icon small></v-icon>
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
                    :class="`${header.value} px-2`"
                    @click="isBall(header.value) && (newFace.ballSet[header.value] = !newFace.ballSet[header.value])"
                >
                    <v-autocomplete
                        v-if="header.value == 'pokemon'"
                        :items="pokemonList"
                        :filter="(item, queryText, itemText) => (prettyfilter(itemText, queryText))"
                        item-text="pokemon.name"
                        return-object
                        autofocus
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
                    @click="tdClicked(header, item)"
                >
                    <template v-if="!isBall(header.value)">
                        <template v-if="header.value === 'pokemonId'">
                            {{ item.item.pokemonId }}
                        </template>
                        <template v-else-if="header.value === 'pokemon'">
                            <div :class="findPokemon(item.item.pokemon).pokemon.cls.join(' ')"></div>
                            {{ item.item.pokemon }}
                            <span v-if="(item.item.needAllBall & 1) === 1" class="blue--text">♂</span>
                            <span v-if="(item.item.needAllBall & 2) === 2" class="red--text">♀</span>
                        </template>
                        <template v-else-if="header.value === 'ability'">
                            {{ getHiddenAbility(item.item.pokemon) }}
                            <v-icon>
                                {{ 'mdi-' + (item.isExpanded ? 'chevron-up' : 'chevron-down') }}
                            </v-icon>
                        </template>
                    </template>
                    <ball-img v-else-if="item.item.ballSet[header.value]" :kind="header.value"></ball-img>
                </td>
            </tr>
        </template>
        <template v-slot:expanded-item="{item, headers}">
            <tr>
                <td
                    v-for="header of headers"
                    :key="header.value"
                    :class="header.value"
                    @click="tdClicked(header, item)"
                >
                    <template v-if="!isBall(header.value)">
                        <template v-if="header.value === 'pokemonId'">
                        </template>
                        <template v-else-if="header.value === 'pokemon'">
                        </template>
                        <template v-else-if="header.value === 'ability'">
                            {{ getHiddenAbility(item.pokemon) }}
                        </template>
                    </template>
                    <ball-img v-else-if="item.hiddenAbility[header.value]" :kind="header.value"></ball-img>
                </td>
            </tr>
        </template>
        <template v-slot:footer="">
            <v-btn @click="copyLink">見せる用リンクを生成してクリップボードにコピー</v-btn>
            <a :href="`/#/?table=${debug}`" > 見せる用リンク</a>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {DataTableHeader} from 'vuetify';
import BallImage from '@/components/BallImage.vue';
import pokemonList from '@/assets/p.json';
import tanepokemonList from '@/assets/q.json';
import Number64 from '@/util/Number64';
import HiraKataConverter from '@/util/HiraKataConverter';

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
    hiddenAbility: BallSet;
    ballSet: BallSet;
    needAllBall: number; // 0 | 1 | 2 | 3; // 性別不明 | オスのみ | メスのみ | 両方
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

@Component({
    components: {
        'ball-img': BallImage,
    },
})
export default class PokemonTable extends Vue {
    private text: string = '';
    private debug: string = '';
    private tanepokemonList = tanepokemonList;
    private pokemonList = pokemonList.filter((p) => this.tanepokemonList.some((q) => q.pokemon === p.pokemon.name.split('\n')[0]));
    private sortBy: string[] = ['pokemon'];
    private sortDesc: boolean[] = [false];
    private search: string = '';
    private registering: boolean = false;
    private newFace: PokemonTableElement = this.resetPokemonTableElement();
    private items: PokemonTableElement[] = [];
    private headers: DataTableHeader[] = [
        {text: 'No', value: 'pokemonId', sort: (a, b) => a - b},
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
    private prettyfilter(text: string, queryText: string): boolean {
        //console.log("text, queryText", text, queryText);
        const hira: string = HiraKataConverter.romahira(queryText);
        //console.log("hira", hira);
        return text.includes(HiraKataConverter.hirakata(hira));
    }
    private manageSortBy(str: string) {
        const path: string = this.isBall(str) ? 'ballSet.' + str : str;
        const index = this.sortBy.indexOf(path);
        if(index < 0) {
            this.sortBy.push(path);
            this.sortDesc.push(false);
        } else if(this.sortDesc[index] === false) {
            this.sortDesc.splice(index, 1, true);
        } else {
            this.sortBy.splice(index, 1);
            this.sortDesc.splice(index, 1);
        }
    }
    private isSorted(str: string): number {
        const path: string = this.isBall(str) ? 'ballSet.' + str : str;
        const index = this.sortBy.indexOf(path);
        return index;
    }
    private isDesc(str: string): boolean {
        const index = this.isSorted(str);
        if(index < 0) throw new Error(`sort saretenai ${str}`);
        return this.sortDesc[index];
    }
    private isBall(str: string): boolean {
        return Balls.includes(str);
    }
    private findPokemon(name: string) {
        const pokemon = this.pokemonList.find((p) => p.pokemon.name === name);
        if(!pokemon) throw new Error(`nanka okasii :${name}: `);
        return pokemon;
    }
    private getHiddenAbility(name: string): string {
        const pokemon = this.findPokemon(name);
        if(pokemon.abilities.hiddenAbility.length === 0) return '---';
        return pokemon.abilities.hiddenAbility[0];
    }
    private resetPokemonTableElement(): PokemonTableElement {
        return {
            pokemonId: 0,
            pokemon: '',
            hiddenAbility: {
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
            this.newFace = JSON.parse(JSON.stringify(oldFace));
        } else {
            const tane = this.tanepokemonList.find((t) => (t.pokemon === p.pokemon.name));
            this.newFace.pokemon = p.pokemon.name;
            this.newFace.pokemonId = p.number;
            if(tane) this.newFace.needAllBall = tane.needAllBall;
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
        if(!this.pokemonList.find((p) => p.pokemon.name === this.newFace.pokemon)) return this.cancel();
        if(this.havePokemon(this.newFace.pokemon)) this.updatePokemon();
        else this.items.push(this.newFace);
        this.exportItems();
        this.resetRegisterState();
    }
    private cancel() {
        this.resetRegisterState();
    }

    private copyLink() {
        this.exportItems();
        navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}#/?table=${this.debug}`);
    }

    private tdClicked(header: DataTableHeader, item: any) {
        if("expand" in item) {
            if (this.isBall(header.value)) item.item.ballSet[header.value] = !item.item.ballSet[header.value];
            if (header.value === 'ability') item.expand(!item.isExpanded);
        } else { //expanded rows
            if(this.isBall(header.value) && item.ballSet[header.value]) {
                if(item.needAllBall === 3) {
                    for(const ball of Balls) {
                        if(item.ballSet[ball]) item.hiddenAbility[ball] = true;
                    }
                } else {
                    item.hiddenAbility[header.value] = true;
                }
            }
        }
    }

    private exportItems() {
        function encodeBallAndAbility(item: PokemonTableElement): number {
            function toD3(prop: boolean, i: number, arr: BallSet): number {
                return prop ? arr[Balls[i]] ? 2 : 1 : 0;
            }
            return (Balls
                .map((b, i) => toD3(item.ballSet[b], i, item.hiddenAbility))
                .reduce(((a, v) => a * 3 + v), 0));
        }
        const d = this.items.map(
            (item) =>
                (item.needAllBall * 512 + item.pokemonId) * 65536 + encodeBallAndAbility(item));
        const encoded = d.map((n) => (new Number64(n)).toString()).join('');
        this.debug = encoded;
        localStorage.setItem('table', encoded);
    }
    private importItems(encoded: string) {
        if(encoded.length % 5 !== 0) return;
        const encodedArr: string[] = [];
        for(; encoded.length > 0; encoded = encoded.slice(5)) {
            encodedArr.push(encoded.slice(0, 5));
        }
        const decodedArr: number[] = encodedArr.map((s) => Number64.to(s));
        this.items = decodedArr.map((n) => {
            const ret: PokemonTableElement = this.resetPokemonTableElement();
            const num = Math.floor(n / 65536) % 512;
            const pokemon = this.pokemonList.find((p) => p.number === num);
            if(!pokemon) throw new Error(`import dekinai ${num}`);
            const name = pokemon.pokemon.name;
            const tp = this.tanepokemonList.find((t) => t.pokemon == name.split('\n')[0]);
            if(!tp) throw new Error(`tane pokemon dehanai ${name}`);
            n %= 65536;
            ret.pokemonId = num;
            ret.pokemon = name;
            ret.needAllBall = tp.needAllBall;
            for(let i = Balls.length - 1; i >= 0; i--) {
                const d = n % 3;
                ret.hiddenAbility[Balls[i]] = d === 2;
                ret.ballSet[Balls[i]] = d > 0;
                n = Math.floor(n / 3);
            }
            return ret;
        });
    }
    private created() {
        if(!this.$route.query.table || typeof(this.$route.query.table) !== 'string') {
            const encodedFromLocalStorage = localStorage.getItem('table');
            if(encodedFromLocalStorage) this.importItems(encodedFromLocalStorage);
            return;
        }
        const encodedFromQuery: string = this.$route.query.table;
        this.importItems(encodedFromQuery);
    }
}
</script>

<style scoped>
    table, tr, td, th {border-collapse: collapse; border-color: aliceblue; }
    .pokemonId {max-width: 80px; width: 80px; min-width: 80px; }
    .pokemon {max-width: 160px; width: 160px; min-width: 160px; }
    .ability {max-width: 160px; width: 160px; min-width: 160px;}
    .love { background-color: rgba(255, 225, 255, 1); }
    .moon { background-color: rgba(236, 236, 255, 1); }
    .heavy { background-color: rgba(236, 236, 236, 1); }
    .level { background-color: rgba(255, 255, 216, 1); }
    .friend { background-color: rgba(216, 255, 216, 1); }
    .fast { background-color: rgba(255, 225, 225, 1); }
    .lure { background-color: rgba(225, 236, 255, 1); }
    .dream { background-color: rgba(255, 216, 255, 1); }
    .beast { background-color: rgba(216, 225, 255, 1); }

    .love, .moon, .heavy, .level, .friend, .fast, .lure, .dream, .beast {
        max-width: 80px;
        width: 80px;
    }

</style>
