<template>
    <v-data-table
        :headers="headers"
        :hide-default-header="true"
        :items="items"
        item-key="pokemon"
        sort-by="pokemon"
        :search="search"
        show-select
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
                    <th v-for="header of headers" :class="header.value">
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
                    :class="header.value"
                    @click="isBall(header) && (newFace[header.value] = !newFace[header.value])"
                >
                    <v-autocomplete
                        v-if="header.value == 'pokemon'"
                        :items="pokemonList"
                        :filter="pokemonFilter"
                        item-text="pokemon.name"
                        item-value="pokemon.ability"
                        :search-input.sync="newFace.pokemon"
                    ></v-autocomplete>
                    <ball-img v-else-if="newFace[header.value]" :kind="header.value"></ball-img>
                </td>
            </tr>
        </template>
        <template v-slot:item="item">
            <tr>
                <td
                    v-for="header of item.headers"
                    :class="header.value"
                    @click="isBall(header) && (item.item[header.value] = !item.item[header.value])"
                >
                    <template v-if="!isBall(header)">
                        <template v-if="header.value == 'number'">
                            {{ pokemonList.find((p) => p.pokemon.name == item.item.pokemon).number }}
                        </template>
                        <template v-else-if="header.value == 'pokemon'">
                            {{ pokemonList.find((p) => p.pokemon.name == item.item.pokemon).pokemon.name }}
                        </template>
                        <template v-else-if="header.value == 'ability'">
                            {{ pokemonList.find((p) => p.pokemon.name == item.item.pokemon).abilities.hiddenAbility.join('') }}
                        </template>
                    </template>
                    <ball-img v-else-if="item.item[header.value]" :kind="header.value"></ball-img>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {DataTableHeader} from 'vuetify';
import BallImage from '@/components/BallImage.vue';
import pokemonList from '@/assets/po.json';

interface PokemonTableElement {
    pokemon: string;
    hiddenAbility: boolean[];
    needAllBall: boolean;
    love: boolean;
    moon: boolean;
    heavy: boolean;
    level: boolean;
    friend: boolean;
    fast: boolean;
    lure: boolean;
    dream: boolean;
    beast: boolean;
}

const Balls: string[] = [
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
    private text: string = 'hoge';
    private pokemonList = pokemonList;
    private search: string = '';
    private registering: boolean = false;
    private newFace: PokemonTableElement = {
        pokemon: '',
        hiddenAbility: [],
        needAllBall: false,
        love: false,
        moon: false,
        heavy: false,
        level: false,
        friend: false,
        fast: false,
        lure: false,
        dream: false,
        beast: false,
    };
    private items: PokemonTableElement[] = [];
    private headers: DataTableHeader[] = [
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
        // console.log(poke);
        return poke.pokemon.name;
    }
    private isBall(header: DataTableHeader): boolean {
        return Balls.includes(header.value);
    }

    private resetNewFace() {
        this.newFace = {
            pokemon: '',
            hiddenAbility: [],
            needAllBall: false,
            love: false,
            moon: false,
            heavy: false,
            level: false,
            friend: false,
            fast: false,
            lure: false,
            dream: false,
            beast: false,
        };
    }
    private resetRegisterState() {
        this.registering = false;
        this.resetNewFace();
    }
    private registerPokemon() {
        // console.log(this.newFace);
        // if(this.newFace.pokemon) return this.cancel();
        this.items.push(this.newFace);
        this.resetRegisterState();
    }
    private cancel() {
        this.resetRegisterState();
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
