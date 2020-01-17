<template>
    <v-data-table
        :headers="headers"
        :hide-default-header="true"
        :items="items">
        <template v-slot:header="{props: { headers }}">
            <thead>
                <tr>
                    <th v-for="header of headers">
                        <v-img v-if="header.value != 'pokemon'" :src="require(`@/assets/ball/${header.value}ball.png`)"></v-img>
                        {{ header.text }}
                    </th>
                </tr>
            </thead>
        </template>
    </v-data-table>
    <!--v-data-table
            :headers="headers"
            :items="desserts"
    ></v-data-table-->
</template>
<script lang="ts">
export default {
    name: 'pokemonTable',
    data: () => ({
        headers: [
            {text: 'ポケモン', value: 'pokemon'},
            {text: 'ラブラブボール', value: 'love'},
            {text: 'ムーンボール', value: 'moon'},
            {text: 'ヘビーボール', value: 'heavy'},
            {text: 'レベルボール', value: 'level'},
            {text: 'フレンドボール', value: 'friend'},
            {text: 'スピードボール', value: 'fast'},
            {text: 'ルアーボール', value: 'lure'},
            {text: 'ドリームボール', value: 'dream'},
            {text: 'ウルトラボール', value: 'beast'},
        ],
        items: [
            {pokemon: 'サルノリ'},
            {pokemon: 'ヒバニー'},
            {pokemon: 'メッソン'},
        ],
    }),
};
</script>