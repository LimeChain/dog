<template>
  <div class="row" v-if="tokenName">
    <div class="col-12">
      <h1>{{tokenName}}</h1>
    </div>
    <div class="col-12 stats">
      <h2>Statistics</h2>
      <ul>
        <li>Your token balance: {{this.tokenBalanceHR}}</li>
        <li>Buy price: {{this.buyPriceHR}}</li>
        <li>Sell price: {{this.sellPriceHR}}</li>
        <li>Organisation reserve ratio: {{this.reserveRatio}}</li>
      </ul>
    </div>
    <div class="col-6 col-lg-3">
      <div class="card interaction-card">
        <h2>Invest</h2>
        <div class="row" v-if="!investmentTokenEnabled">
          <div class="col-12">
            <h4>Enable Investing</h4>
            <button type="button" class="btn btn-primary" @click="enableInvestment">Enable investing</button>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <label for="investAmount">Invest amount</label>
              <input
                type="number"
                class="form-control"
                id="investAmount"
                v-model="inputModels.investAmount"
              />
              <small
                id="investAmountHelp"
                class="form-text text-muted"
              >How much tokens do you want to invest</small>
              <br />
              <button
                type="button"
                class="btn btn-primary"
                @click="invest"
                :disabled="!investmentTokenEnabled"
              >Invest</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="card interaction-card">
        <h2>Sell</h2>
        <div class="row" v-if="!dogTokenEnabled">
          <div class="col-12">
            <h4>Enable Selling</h4>
            <button type="button" class="btn btn-primary" @click="enableSell">Enable selling</button>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <label for="sellAmount">Sell amount</label>
              <input
                type="number"
                class="form-control"
                id="sellAmount"
                v-model="inputModels.sellAmount"
              />
              <small
                id="sellAmountHelp"
                class="form-text text-muted"
              >How much tokens do you want to sell</small>
              <br />
              <button
                type="button"
                class="btn btn-primary"
                @click="sell"
                :disabled="!dogTokenEnabled"
              >Sell</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="card interaction-card">
        <h2>Pay Dividends</h2>
        <div class="row" v-if="!investmentTokenEnabled">
          <div class="col-12">
            <h4>Enable Paying Dividends</h4>
            <button
              type="button"
              class="btn btn-primary"
              @click="enableInvestment"
            >Enable paying dividends</button>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <label for="dividendAmount">Dividend amount</label>
              <input
                type="number"
                class="form-control"
                id="dividendAmount"
                v-model="inputModels.dividendAmount"
              />
              <small
                id="dividendAmountHelp"
                class="form-text text-muted"
              >How much do you want to pay as dividend</small>
              <br />
              <button
                type="button"
                class="btn btn-primary"
                @click="payDividends"
                :disabled="!investmentTokenEnabled"
              >Pay Dividend</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-lg-3" v-if="!isUnlocked">
      <div class="card interaction-card">
        <h2>Unlock Organisation</h2>
        <div class="row" v-if="!investmentTokenEnabled">
          <div class="col-12">
            <h4>Enable Unlocking</h4>
            <button type="button" class="btn btn-primary" @click="enableInvestment">Enable unlocking</button>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <label for="unlockInvestAmount">Invest amount</label>
              <input
                type="number"
                class="form-control"
                id="unlockInvestAmount"
                v-model="inputModels.unlockInvestAmount"
              />
              <small
                id="unlockInvestAmountHelp"
                class="form-text text-muted"
              >How much do you want to invest when unlocking</small>
              <br />
              <label for="unlockPremintAmount">Invest pre-mint</label>
              <input
                type="number"
                class="form-control"
                id="unlockPremintAmount"
                v-model="inputModels.unlockPremintAmount"
              />
              <small
                id="unlockPremintAmountHelp"
                class="form-text text-muted"
              >How much tokens do you want to receive when unlocking</small>
              <br />
              <button
                type="button"
                class="btn btn-primary"
                @click="unlock"
                :disabled="!investmentTokenEnabled"
              >Unlock</button>
            </div>
          </div>
        </div>
      </div>
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
      inputModels: {
        unlockInvestAmount: 0,
        unlockPremintAmount: 0,
        investAmount: 0,
        sellAmount: 0,
        dividendAmount: 0
      },
      tokenName: "",
      dogTokenSymbol: "",
      investTokenSymbol: "",
      tokenBalance: 0,
      reserveRatio: 0,
      dogTokenContract: (null as unknown) as ethers.Contract,
      investmentTokenContract: (null as unknown) as ethers.Contract,
      organisation: (null as unknown) as DOG,
      provider: (null as unknown) as ethers.providers.Web3Provider,
      signer: (null as unknown) as ethers.Signer,
      investmentTokenEnabled: false,
      dogTokenEnabled: false,
      organisationState: 0,
      reserveBalance: 0,
      buyPrice: 0,
      sellPrice: 0
    };
  },
  async created() {
    let ethereum = window.ethereum;
    await ethereum.enable();

    this.provider = new ethers.providers.Web3Provider(ethereum);
    this.signer = this.provider.getSigner();
    const signerAddress = this.signer.getAddress();
    this.organisation = DOG.at(this.$route.params.address, this.signer);
    this.dogTokenContract = await this.organisation.getDogToken();
    this.investmentTokenContract = await this.organisation.getInvestmentToken();
    const approvedInvestmentBalance = await this.investmentTokenContract.allowance(
      signerAddress,
      this.$route.params.address
    );
    this.investmentTokenEnabled = approvedInvestmentBalance.gt(0);
    const approvedDogBalance = await this.dogTokenContract.allowance(
      signerAddress,
      this.$route.params.address
    );
    this.dogTokenEnabled = approvedDogBalance.gt(0);
    this.organisationState = await this.organisation.dogOrgState();
    this.reserveRatio = await this.organisation.USD_RESERVE_REMAINDER();
    this.buyPrice = await this.organisation.calcDogForUSD(
      ethers.utils.parseEther("1")
    );

    this.sellPrice = await this.organisation.calcUSDForDog(
      ethers.utils.parseEther("1")
    );

    this.tokenBalance = await this.dogTokenContract.balanceOf(signerAddress);
    this.dogTokenSymbol = await this.dogTokenContract.symbol();
    this.investTokenSymbol = await this.investmentTokenContract.symbol();
    this.tokenName = await this.dogTokenContract.name();
  },
  methods: {
    async enableInvestment() {
      const tx = await this.investmentTokenContract.approve(
        this.$route.params.address,
        ethers.constants.MaxUint256
      );

      await tx.wait();
      this.investmentTokenEnabled = true;
    },
    async enableSell() {
      const tx = await this.dogTokenContract.approve(
        this.$route.params.address,
        ethers.constants.MaxUint256
      );

      await tx.wait();
      this.dogTokenEnabled = true;
    },
    async unlock() {
      // TODO Validate
      const tx = await this.organisation.unlockOrganisation(
        ethers.utils.parseEther(this.inputModels.unlockInvestAmount),
        ethers.utils.parseEther(this.inputModels.unlockPremintAmount)
      );

      await tx.wait();
      this.organisationState = await this.organisation.dogOrgState();
      await this.refreshStats();
    },
    async invest() {
      const tx = await this.organisation.invest(
        ethers.utils.parseEther(this.inputModels.investAmount)
      );

      await tx.wait();
      await this.refreshStats();

      this.inputModels.investAmount = 0;
    },
    async sell() {
      const tx = await this.organisation.sell(
        ethers.utils.parseEther(this.inputModels.sellAmount)
      );

      await tx.wait();
      await this.refreshStats();

      this.inputModels.sellAmount = 0;
    },
    async payDividends() {
      const tx = await this.organisation.payDividends(
        ethers.utils.parseEther(this.inputModels.dividendAmount),
        this.reserveRatio
      );

      await tx.wait();
      await this.refreshStats();

      this.inputModels.dividendAmount = 0;
    },
    async refreshStats() {
      const signerAddress = this.signer.getAddress();
      this.tokenBalance = await this.dogTokenContract.balanceOf(signerAddress);
      this.buyPrice = await this.organisation.calcDogForUSD(
        ethers.utils.parseEther("1")
      );
      this.sellPrice = await this.organisation.calcUSDForDog(
        ethers.utils.parseEther("1")
      );
    }
  },
  computed: {
    tokenBalanceHR() {
      return `${ethers.utils.formatEther(this.tokenBalance)} ${
        this.dogTokenSymbol
      }`;
    },
    reserveAmountHR() {
      return `${ethers.utils.formatEther(this.tokenBalance)} ${
        this.dogTokenSymbol
      }`;
    },
    buyPriceHR() {
      const HRBuyPrice = Number.parseFloat(
        ethers.utils.formatEther(this.buyPrice)
      );
      return `${1 / HRBuyPrice} ${this.investTokenSymbol} / ${
        this.dogTokenSymbol
      }`;
    },
    sellPriceHR() {
      return `${ethers.utils.formatEther(this.sellPrice)} ${
        this.investTokenSymbol
      } / ${this.dogTokenSymbol}`;
    },
    isUnlocked() {
      return this.organisationState == 1;
    }
  }
});
</script>

<style lang="less">
@import "../index.less";
.stats {
  text-align: left;
}
.interaction-card {
  margin: 10px;
  padding: 10px 20px;
  .drop-shadow();
}
</style>
