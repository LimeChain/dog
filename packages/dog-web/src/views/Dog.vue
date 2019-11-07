<template>
  <div class="row">
    <div class="col-12">
      <h1>{{tokenName}}</h1>
    </div>
    <div class="col-12 stats">
      <h2>Statistics</h2>
    </div>
    <div class="col-6">
      <h2>Unlock Organisation</h2>
    </div>
    <div class="col-6">
      <h2>Pay Dividends</h2>
    </div>
    <div class="col-6">
      <h2>Invest</h2>
    </div>
    <div class="col-6">
      <h2>Sell</h2>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { NetworkConstants, DOG } from "dog-sdk";
import { ethers } from "ethers";

declare let window: any;

export default Vue.extend({
  name: "home",
  components: {},
  data() {
    return {
      tokenName: "",
      dogTokenContract: (null as unknown) as ethers.Contract,
      investmentTokenContract: (null as unknown) as ethers.Contract,
      organsiation: (null as unknown) as DOG,
      provider: (null as unknown) as ethers.providers.Web3Provider,
      signer: (null as unknown) as ethers.Signer
    };
  },
  async created() {
    let ethereum = window.ethereum;
    await ethereum.enable();

    this.provider = new ethers.providers.Web3Provider(ethereum);
    this.signer = this.provider.getSigner();
    this.organsiation = DOG.at(this.$route.params.address, this.signer);
    this.dogTokenContract = await this.organsiation.getDogToken();
    this.investmentTokenContract = await this.organsiation.getInvestmentToken();
    this.tokenName = await this.dogTokenContract.name();
  }
});
</script>
