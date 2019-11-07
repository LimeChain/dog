<template>
  <div class="card" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">{{dog.tokenName}}</h5>
      <router-link :to="`/dog/${dog.address}`" class="btn btn-primary">DOG Profile</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DogCard",
  props: ["dog"],
  components: {},
  data() {
    return {};
  },
  methods: {},
  computed: {}
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
