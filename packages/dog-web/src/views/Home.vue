<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-4 col-md-3 col-lg-2" v-for="org in organsiations" v-bind:key="org.address">
        <dog-card :dog="org" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DogCard from "@/components/DogCard.vue"; // @ is an alias to /src

import { NetworkConstants, DOGRegistry, DOGMetadata } from "dog-sdk";
import { ethers } from "ethers";

declare let window: any;

export default Vue.extend({
  name: "home",
  components: {
    DogCard
  },
  data() {
    return {
      registry: (null as unknown) as DOGRegistry,
      organsiations: (null as unknown) as DOGMetadata[],
      provider: (null as unknown) as ethers.providers.Web3Provider,
      signer: (null as unknown) as ethers.Signer
    };
  },
  async created() {
    let ethereum = window.ethereum;
    await ethereum.enable();

    this.provider = new ethers.providers.Web3Provider(ethereum);
    this.signer = this.provider.getSigner();
    this.registry = await DOGRegistry.for(this.provider);
    this.organsiations = await this.registry.getAllOrganisationsMetadata();
    console.log(this.organsiations);
  }
});
</script>
