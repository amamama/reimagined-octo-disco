<template>
  <v-app>
    <v-content>
      <PokemonTable />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import PokemonTable from '@/components/PokemonTable.vue';

export default Vue.extend({
  name: 'App',
  components: {PokemonTable},
});
</script>
