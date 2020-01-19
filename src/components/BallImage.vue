<template>
    <v-img
        :src="require(`@/assets/ball/${kind}ball.png`)"
        :alt="`${kind}ball`"
        max-width="40px"
        max-height="40px"
        class="mx-auto"
    ></v-img>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BallImage extends Vue {
    @Prop({required: true})
    private kind!: string;
}
</script>

