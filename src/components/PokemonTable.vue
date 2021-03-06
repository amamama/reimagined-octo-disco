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
                    @click="tdClicked(header, newFace.ballSet, newFace.pokemon)"
                >
                    <template v-if="!isBall(header.value)">
                        <template v-if="header.value === 'pokemonId'">
                        </template>
                        <template v-else-if="header.value === 'pokemon'">
                            <v-autocomplete
                                    :items="pokemonList"
                                    :filter="(item, queryText, itemText) => (prettyfilter(itemText, queryText))"
                                    item-text="pokemon.name"
                                    return-object
                                    autofocus
                                    @input="updateNewFace"
                            ></v-autocomplete>
                        </template>
                        <template v-else-if="header.value === 'ability'">
                            {{ newFace.pokemon === '' ? '' : getHiddenAbility(newFace.pokemon) }}
                            <v-icon v-if="false">
                                ここに隠れ特性を持っており隠れ特性の所持の考慮が必要ないポケモンの場合
                                （ 両性が存在し少なくとも１つのオシャボで隠れ特性を所持している場合）
                                は○か✓を出す．
                                遺伝で増やせないが夢特性を持っている場合は△，
                                全く持っていない場合は☓を出す
                            </v-icon>
                        </template>
                    </template>
                    <ball-img
                        :style="`filter: grayscale(${newFace.ballSet[header.value] === 2?0:0.8});`"
                        v-else-if="newFace.ballSet[header.value] !== 0"
                        :kind="header.value">
                    </ball-img>
                </td>
            </tr>
        </template>
        <template v-slot:item="item">
            <tr>
                <td
                    v-for="header of item.headers"
                    :key="header.value"
                    :class="header.value"
                    @click="tdClicked(header, item.item.ballSet, item.item.pokemon)"
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
                            <v-icon v-if="false">
                                ここに隠れ特性を持っており隠れ特性の所持の考慮が必要ないポケモンの場合
                                （ 両性が存在し少なくとも１つのオシャボで隠れ特性を所持している場合）
                                は○か✓を出す．
                                遺伝で増やせないが夢特性を持っている場合は△，
                                全く持っていない場合は☓を出す
                            </v-icon>
                        </template>
                    </template>
                    <ball-img
                        :style="`filter: grayscale(${item.item.ballSet[header.value] === 2?0:0.8});`"
                        v-else-if="item.item.ballSet[header.value] !== 0"
                        :kind="header.value"
                    ></ball-img>
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

type BallType = 'love' | 'moon' | 'heavy' | 'level' | 'friend' | 'fast' | 'lure' | 'dream' | 'beast' | 'sport' | 'safari';
/*interface BallSet {
    love: 0 | 1 | 2;
    moon: 0 | 1 | 2;
    heavy: 0 | 1 | 2;
    level: 0 | 1 | 2;
    friend: 0 | 1 | 2;
    fast: 0 | 1 | 2;
    lure: 0 | 1 | 2;
    dream: 0 | 1 | 2;
    beast: 0 | 1 | 2;
    sport: 0 | 1 | 2;
    safari: 0 | 1 | 2;
    [key: string]: 0 | 1 | 2;
}*/
type BallSet = {[key in BallType]: 0 | 1 | 2 };
interface Pokemon {
    pokemon: {
        name: string;
        cls: string[];
    };
    abilities: {
        normalAbility: string[];
        hiddenAbility: string[];
    };
    types: string[];
}

interface PokemonTableElement {
    pokemonId: string;
    pokemon: string;
    ballSet: BallSet;
    needAllBall: number; // 0 | 1 | 2 | 3; // 性別不明 | オスのみ | メスのみ | 両方
}

function initPokemonTableElement(): PokemonTableElement {
    return {
        pokemonId: '',
        pokemon: '',
        needAllBall: 3,
        ballSet: {
            love: 0,
            moon: 0,
            heavy: 0,
            level: 0,
            friend: 0,
            fast: 0,
            lure: 0,
            dream: 0,
            beast: 0,
            sport: 0,
            safari: 0,
        },
    };
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
    'sport',
    'safari',
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
    private pokemonList: Pokemon[] = pokemonList.filter((p) => this.tanepokemonList.some((q) => q.pokemon === p.pokemon.name));
    private sortBy: string[] = ['pokemon'];
    private sortDesc: boolean[] = [false];
    private search: string = '';
    private registering: boolean = false;
    private newFace: PokemonTableElement = initPokemonTableElement();
    private items: PokemonTableElement[] = [];
    private headers: DataTableHeader[] = [
        {text: 'No', value: 'pokemonId'},
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
        {text: 'コンペボール', value: 'sport'},
        {text: 'サファリボール', value: 'safari'},
    ];
    private prettyfilter(text: string, queryText: string): boolean {
        const hira: string = HiraKataConverter.romahira(queryText);
        return text.includes(HiraKataConverter.hirakata(hira));
    }
    private manageSortBy(str: string) {
        const path: string = this.isBall(str) ? 'ballSet.' + str : str;
        const index = this.sortBy.indexOf(path);
        if(index < 0) {
            this.sortBy.push(path);
            this.sortDesc.push(false);
        } else if(!this.sortDesc[index]) {
            this.sortDesc.splice(index, 1, true);
        } else {
            this.sortBy.splice(index, 1);
            this.sortDesc.splice(index, 1);
        }
    }
    private isSorted(str: string): number {
        return this.sortBy.indexOf(this.isBall(str) ? 'ballSet.' + str : str);
    }
    private isDesc(str: string): boolean {
        const index = this.isSorted(str);
        if(index < 0) throw new Error(`sort saretenai ${str}`);
        return this.sortDesc[index];
    }
    private isBall(str: string): str is BallType {
        return (Balls as Array<string>).includes(str);
   }

    private findPokemon(name: string) {
        return this.pokemonList.find((p) => p.pokemon.name === name);
    }
    private getHiddenAbility(name: string): string {
        const pokemon = this.findPokemon(name);
        if(!pokemon) return 'pokemon not found';
        if(pokemon.abilities.hiddenAbility.length === 0) return '---';
        return pokemon.abilities.hiddenAbility[0];
    }
    private haveHiddenAbility(name: string) {
        const p = this.findPokemon(name);
        if(!p) return false;
        return p.abilities.hiddenAbility.length > 0;
    }
    private havePokemon(name: string): PokemonTableElement | undefined {
        return this.items.find((item) => item.pokemon === name);
    }
    private getTanePokemon(p: Pokemon) {
        const tane = this.tanepokemonList.find((t) => (t.pokemon === p.pokemon.name));
        if(!tane) throw new Error('tane pokemon ja nai');
        return tane;
    }
    private getPokemonId(p: Pokemon): string {
        const n = p.pokemon.cls.find((s) => s.startsWith('n'));
        if(!n) throw new Error('なんかおかしい');
        return n;
    }
    private updateNewFace(p: Pokemon) {
        const oldFace = this.havePokemon(p.pokemon.name);
        if(oldFace) {
            this.newFace = JSON.parse(JSON.stringify(oldFace));
        } else {
            this.newFace.pokemon = p.pokemon.name;
            this.newFace.pokemonId = this.getPokemonId(p);
            this.newFace.needAllBall = this.getTanePokemon(p).needAllBall;
        }
    }
    private resetRegisterState() {
        this.registering = false;
        this.newFace = initPokemonTableElement();
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

    private  inclBall(bs: BallSet, k: keyof BallSet) {
        const n = (bs[k] + 1) % 3;
        bs[k] = n === 0 ? 0 : n === 1 ? 1 : 2;
    }

    private tdClicked(header: DataTableHeader, bs: BallSet, name: string) {
        if (!this.isBall(header.value)) return;
        function haveAnyHiddenAbility(ha: BallSet) {
            for(const ball of Balls) if(ha[ball] === 2) return true;
            return false;
        }
        this.inclBall(bs, header.value);
        if(bs[header.value] === 1 && (haveAnyHiddenAbility(bs) || !this.haveHiddenAbility(name))) {
            this.inclBall(bs, header.value);
        }
        // TODO: needAllBallを用いて便利にする

        // 上書き保存
        this.exportItems();

    }

    private exportItems() {
        function encodeBallSet(bs: BallSet): number {
            // 0 <= ret < 3^11
            return (Balls.map((b, i, a) => bs[a[i]]).reduce(((a: number, v) => a * 3 + v), 0));
        }
        const fuckThis = this.getPokemonId;
        function encodePokemonId(pid: string) {
            // 1 <= ret < 2^13
            const id = pid.replace(/[a-z]/g, '');
            // 1 <= id < 1000 < 2^10
            const idx = pokemonList.filter((p) => (new RegExp(`n${id}(\$|[a-z])`)).test(fuckThis(p))).findIndex((p) => fuckThis(p) === pid);
            // 0 < idx < 2^3
            if(idx < 0 || idx > 7) throw new Error('hai zako');
            return parseInt(id, 10) * 8 + idx;
        }
        const d = this.items.map((item) => encodePokemonId(item.pokemonId) * 177147 + encodeBallSet(item.ballSet));
        const encoded = d.map((n) => n%177147===0?'':((new Number64(n)).toString().padStart(6, 'A'))).join('');
        this.debug = encoded;
        console.log('length', encoded.length);
        localStorage.setItem('table', encoded);
    }

    private importItems(encoded: string) {
        if(encoded.length % 6 !== 0) return;
        const decodedArr = encoded.replace(/.{6}(?!$)/g, '$&,').split(',').map((s) => Number64.to(s));
        this.items = decodedArr.map((n: number) => {
            const ret: PokemonTableElement = initPokemonTableElement();
            const idAndForm = Math.floor(n / 177147);
            const id = Math.floor(idAndForm / 8);
            const form = idAndForm % 8;
            const pokemon = this.pokemonList.filter((p) => (new RegExp(`n${id}(\$|[a-z])`)).test(this.getPokemonId(p)))[form];
            if(!pokemon) throw new Error(`import dekinai ${n}, ${id}, ${form}`);
            const tp = this.getTanePokemon(pokemon);
            n %= 177147; // 3^11
            ret.pokemon = pokemon.pokemon.name;
            ret.pokemonId = this.getPokemonId(pokemon);
            ret.needAllBall = tp.needAllBall;
            Balls.reduceRight(((a: number, v, i) => {
                const d = a % 3;
                ret.ballSet[Balls[i]] = d === 0 ? 0 : d === 1 ? 1 : 2;
                return Math.floor(a / 3);
            }), n);
            return ret;
        });
    }

    private created() {
        if (!this.$route.query.table || typeof (this.$route.query.table) !== 'string') {
            const encodedFromLocalStorage = localStorage.getItem('table');
            if (encodedFromLocalStorage) this.importItems(encodedFromLocalStorage);
            return;
        }
        const encodedFromQuery: string = this.$route.query.table;
        this.importItems(encodedFromQuery);
    }
}
</script>

<style scoped>
    table, tr, td, th {border-collapse: collapse; border-color: aliceblue; }
    .pokemonId {max-width: 60px; width: 60px; min-width: 60px; }
    .pokemon {max-width: 240px; width: 240px; min-width: 240px; }
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
    .sport { background-color: rgba(255, 216, 216, 1); }
    .safari { background-color: rgba(216, 225, 216, 1); }

    .love, .moon, .heavy, .level, .friend, .fast, .lure, .dream, .beast, .sport, .safari {
        max-width: 80px;
        width: 80px;
    }

</style>
