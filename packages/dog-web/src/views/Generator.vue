<template>
  <div id="generator">
    <div class="col-12 col-md-10 col-lg-8 col-xl-6 page-container">
      <div class="form-container col-10 offset-1 text-left">
        <form-wizard
          ref="generator"
          @on-complete="onComplete"
          color="#E4BD37"
          error-color="#A61C3C"
        >
          <span slot="title"></span>
          <tab-content title="Network Details" icon="ti-link" :before-change="onNetworkCompleted">
            <div class="form-group">
              <label for="network">1. What network do you want to use?</label>
              <small
                id="networkHelp"
                class="form-text text-muted"
              >Choose a blockchain network you want to use. "mainnet" is the real Ethereum network, whereas the others are test networks.</small>
              <select v-model="network" class="form-control">
                <option v-for="n in networks" v-bind:value="n" v-bind:key="n">{{ n }}</option>
              </select>
            </div>
          </tab-content>
          <tab-content
            title="Investment Details"
            icon="ti-money"
            :before-change="onInvestmentCompleted"
          >
            <span slot="title"></span>
            <div class="form-group">
              <label for="investmentToken">2. What token do you want to be used for investment?</label>
              <small
                id="investmentTokenHelp"
                class="form-text text-muted"
              >Choose which token do you want to use as investment token for your DOG.</small>
              <select v-model="investmentToken" class="form-control">
                <option
                  v-for="token in investmentTokens"
                  v-bind:value="token.value"
                  v-bind:key="token.id"
                >{{ token.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="bankAddress">3. What address will be holding the investment fund?</label>
              <small
                id="bankAddressHelp"
                class="form-text text-muted"
              >TLDR - Where the invested funds go. The investment fund is the life blood of the DOG. These are the funds you use for investments that will bring you back dividends.</small>
              <input
                type="text"
                class="form-control"
                id="bankAddress"
                v-model="bankAddress"
                placeholder="0x1abcd..."
              />
            </div>
            <div class="form-group">
              <label
                for="reserveRatio"
              >4. What percentage should go stay to in the contract, after each investment?</label>
              <small
                id="reserveRatioHelp"
                class="form-text text-muted"
              >Define what % of the invested funds by your investors will be staying in the contract in order to cover for sells of tokens. The rest goes to your investment fund. The number must be between 1 and 99</small>
              <input
                type="number"
                class="form-control col-2"
                id="reserveRatio"
                v-model="reserveRatio"
                placeholder="20"
              />
            </div>
          </tab-content>
          <tab-content
            title="Tokens Details"
            icon="ti-stats-up"
            :before-change="onTokenDetailsCompleted"
          >
            <span slot="title"></span>
            <div class="form-group">
              <label for="tokenName">5. What would be the name of the DOG token?</label>
              <small
                id="tokenNameHelp"
                class="form-text text-muted"
              >The name of the token that will be received by the DOG investors.</small>
              <input
                type="text"
                class="form-control"
                id="tokenName"
                v-model="tokenName"
                placeholder="Dog Token"
              />
            </div>
            <div class="form-group">
              <label for="tokenSymbol">6. What would be the symbol of the DOG token?</label>
              <small
                id="tokenSymbolHelp"
                class="form-text text-muted"
              >The symbol of the token that will be received by the DOG investors. Keep it short between 2 and 5 characters</small>
              <input
                type="text"
                class="form-control"
                id="tokenSymbol"
                v-model="tokenSymbol"
                placeholder="DOG"
              />
            </div>
          </tab-content>
        </form-wizard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import * as assist from "bnc-assist";
import { NetworkConstants, DOGBuilder } from "dog-sdk";
import { ethers } from "ethers";
import Vue from "vue";

declare let window: any;

export default Vue.extend({
  name: "generator",
  data() {
    return {
      investmentTokens: new Array<any>(),
      investmentToken: "",
      tokenName: "",
      tokenSymbol: "",
      bankAddress: "",
      networks: new Array<string>(),
      network: "",
      reserveRatio: 20,
      provider: (null as unknown) as ethers.providers.Web3Provider,
      signer: (null as unknown) as ethers.Signer
    };
  },
  created() {
    this.networks = NetworkConstants.getNetworks();
  },
  components: {},
  methods: {
    async onNetworkCompleted() {
      if (this.network.length == 0) {
        return false;
      }
      const bncAssistConfig = {
        dappId: "1aa2c0e3-348c-49fb-bc61-6ce96e5bf21a",
        networkId: NetworkConstants.getNetworkId(this.network),
        ethers: ethers,
        minimumBalance: "10000000000000000",
        recommendedWallets: {
          desktop: [
            {
              name: "MetaMask",
              link: "https://metamask.io/",
              icon: "https://metamask.io/img/metamask.png"
            }
          ],
          mobile: [
            {
              name: "Coinbase",
              link: "https://wallet.coinbase.com/",
              icon:
                "https://cdn-images-1.medium.com/max/1200/1*7ywNS48PnonfsvvMu1tTsA.png"
            },
            {
              name: "Trust",
              link: "https://trustwallet.com/",
              icon:
                "https://uploads-ssl.webflow.com/5a88babea6e0f90001b39b0d/5a8cf5a81df25e0001d5c78d_logo_solid_square_blue%20(2).png"
            }
          ]
        }
      };

      const assistInstance = assist.init(bncAssistConfig);
      await assistInstance.onboard();
      let ethereum = window.ethereum;
      await ethereum.enable();

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      this.provider = provider;
      this.signer = signer;

      this.investmentTokens = NetworkConstants.getInvestmentTokens(
        this.network // TODO change with metamask provider
      );
      this.investmentToken = this.investmentTokens[0].value;
      this.bankAddress = await signer.getAddress();

      return true;
    },
    onInvestmentCompleted() {
      try {
        ethers.utils.getAddress(this.bankAddress);

        return this.reserveRatio > 1 && this.reserveRatio < 99;
      } catch (e) {
        return false;
      }
    },
    onTokenDetailsCompleted() {
      if (this.tokenSymbol.length < 2) {
        return false;
      }

      if (this.tokenName.length < 3) {
        return false;
      }
      return true;
    },
    async onComplete() {
      let builder = new DOGBuilder(this.tokenName, this.tokenSymbol)
        .withReservePercent(this.reserveRatio)
        .withBank(this.bankAddress)
        .withInvestmentTokenAddress(this.investmentToken);
      const deploymentInfo = await builder.deploy(this.signer, this.network);

      console.log(deploymentInfo);

      await deploymentInfo.wait();
    }
  }
});
</script>

<style lang="less">
@import "../index.less";

#generator {
  height: 100%;
}

.wizard-nav {
  :not(.active) {
    .checked {
      color: @success-color;
    }
  }
}
.page-container {
  margin-top: 2%;
}

.tab-passed {
  color: black;
}
.rounded-corners (@radius: 5px) {
  -webkit-border-radius: @radius;
  -moz-border-radius: @radius;
  -ms-border-radius: @radius;
  -o-border-radius: @radius;
  border-radius: @radius;
}
.box-shadow(...) {
  -webkit-box-shadow: @arguments;
  -moz-box-shadow: @arguments;
  box-shadow: @arguments;
}
.form-container {
  background-color: white;
  .rounded-corners();
}
</style>
