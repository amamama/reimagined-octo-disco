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
                <v-spacer></v-spacer>
                hogehoge
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
        <template v-slot:body.prepend="{items, headers}">
            <tr>
                <td v-for="header of headers" :class="header.value">
                    <v-text-field v-if="header.value == 'pokemon'"></v-text-field>
                </td>
            </tr>
        </template>
        <template v-slot:item="item">
            <tr>
                <th
                    v-for="header of item.headers"
                    :class="header.value"
                    @click="isBall(header) && (item.item[header.value] = !item.item[header.value])"
                >
                    <template v-if="!isBall(header)">
                        {{ item.item.pokemon }}
                    </template>
                    <ball-img v-else-if="item.item[header.value]" :kind="header.value"></ball-img>
                </th>
            </tr>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {DataTableHeader} from 'vuetify';
import BallImage from '@/components/BallImage.vue';

@Component({
    components: {
        'ball-img': BallImage,
    },
})
export default class PokemonTable extends Vue {
    private search: string = '';
    private headers: DataTableHeader[] = [
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
    private items = [
        {pokemon: 'ヒバニー'},
        {pokemon: 'メッソン'},
        {pokemon: 'サルノリ'},
        {pokemon: '1'},
        {pokemon: '22'},
        {pokemon: '333'},
        {pokemon: '4444'},
        {pokemon: '55555'},
        {pokemon: '666666'},
        {pokemon: '7777777'},
        {pokemon: '88888888'},
        {pokemon: '999999999'},
        {pokemon: '00000000000000000000000'},
    ].map((p) => ({
        ...p,
        love: false,
        moon: false,
        heavy: false,
        level: false,
        friend: false,
        fast: false,
        lure: false,
        dream: false,
        beast: false,
    }));
    private isBall(header: DataTableHeader): boolean {
        return header.value !== 'pokemon' && header.value !== 'ability';
    }
}
</script>

<style scoped>
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
</style>
