<script setup lang="ts">
import SectionLithology from './geological/SectionLithology.vue';
import SectionFractures from './geological/SectionFractures.vue';
import SectionCaves from './geological/SectionCaves.vue';
</script>

<template>
  <div class="flex flex-col gap-8 p-6">
    <SectionLithology />
    <SectionFractures />
    <SectionCaves />
  </div>
</template>
