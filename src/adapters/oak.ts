import { Storage } from "@acala-network/sdk/utils/storage";
import { AnyApi, FixedPointNumber as FN } from "@acala-network/sdk-core";
import { combineLatest, map, Observable } from "rxjs";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { ApiNotFound, InvalidAddress, TokenNotFound } from "../errors";
import { BalanceData, ExtendedToken, TransferParams } from "../types";
import { createRouteConfigs, validateAddress } from "../utils";

const DEST_WEIGHT = "5000000000";

export const turingTokensConfig: Record<string, ExtendedToken> = {
  PHA: {
    name: "PHA",
    symbol: "PHA",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => 7,
  },
  HKO: {
    name: "HKO",
    symbol: "HKO",
    decimals: 12,
    ed: "500000000000",
    toRaw: () => 5,
  },
  SDN: {
    name: "SDN",
    symbol: "SDN",
    decimals: 18,
    ed: "10000000000000000",
    toRaw: () => 8,
  },
  KSM: {
    name: "KSM",
    symbol: "KSM",
    decimals: 12,
    ed: "100000000",
    toRaw: () => 1,
  },
  MOVR: {
    name: "MOVR",
    symbol: "MOVR",
    decimals: 18,
    ed: "0",
    toRaw: () => 9,
  },
  AUSD: {
    name: "AUSD",
    symbol: "AUSD",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => 2,
  },
  TUR: {
    name: "TUR",
    symbol: "TUR",
    decimals: 10,
    ed: "100000000",
    toRaw: () => 0,
  },
  SKSM: {
    name: "SKSM",
    symbol: "SKSM",
    decimals: 12,
    ed: "500000000",
    toRaw: () => 6,
  },
  KAR: {
    name: "KAR",
    symbol: "KAR",
    decimals: 12,
    ed: "100000000000",
    toRaw: () => 3,
  },
  LKSM: {
    name: "LKSM",
    symbol: "LKSM",
    decimals: 12,
    ed: "500000000",
    toRaw: () => 4,
  },
  // MGX is not registered on Turing yet
  //   MGX: {
  //     name: "MGX",
  //     symbol: "MGX",
  //     decimals: ,
  //     ed: "",
  //     toRaw: () => ,
  //   },
};

export const turingRouteConfigs = createRouteConfigs("turing", [
  {
    to: "moonriver",
    token: "TUR",
    xcm: {
      fee: { token: "TUR", amount: "480597195" },
      weightLimit: "Unlimited",
    },
  },
  {
    to: "moonriver",
    token: "MOVR",
    xcm: {
      fee: { token: "MOVR", amount: "480597195" },
      weightLimit: "Unlimited",
    },
  },
  {
    to: "shiden",
    token: "TUR",
    xcm: {
      fee: { token: "TUR", amount: "480597195" },
      weightLimit: "Unlimited",
    },
  },
  {
    to: "shiden",
    token: "SDN",
    xcm: {
      fee: { token: "SDN", amount: "480597195" },
      weightLimit: "Unlimited",
    },
  },
]);

export const turingStagingTokensConfig: Record<string, ExtendedToken> = {
  PHA: {
    name: "PHA",
    symbol: "PHA",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => 7,
  },
  HKO: {
    name: "HKO",
    symbol: "HKO",
    decimals: 12,
    ed: "500000000000",
    toRaw: () => 5,
  },
  SDN: {
    name: "SDN",
    symbol: "SDN",
    decimals: 18,
    ed: "10000000000000000",
    toRaw: () => 8,
  },
  KSM: {
    name: "KSM",
    symbol: "KSM",
    decimals: 12,
    ed: "100000000",
    toRaw: () => 1,
  },
  RSTR: {
    name: "RSTR",
    symbol: "RSTR",
    decimals: 18,
    ed: "1000000",
    toRaw: () => 9,
  },
  AUSD: {
    name: "AUSD",
    symbol: "AUSD",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => 2,
  },
  TUR: {
    name: "TUR",
    symbol: "TUR",
    decimals: 10,
    ed: "100000000",
    toRaw: () => 0,
  },
  SKSM: {
    name: "SKSM",
    symbol: "SKSM",
    decimals: 12,
    ed: "500000000",
    toRaw: () => 6,
  },
  KAR: {
    name: "KAR",
    symbol: "KAR",
    decimals: 12,
    ed: "100000000000",
    toRaw: () => 3,
  },
  LKSM: {
    name: "LKSM",
    symbol: "LKSM",
    decimals: 12,
    ed: "500000000",
    toRaw: () => 4,
  },
};

export const turingStagingRouteConfigs = createRouteConfigs("turing-staging", [
  {
    to: "rocstar",
    token: "TUR",
    xcm: {
      fee: { token: "TUR", amount: "2560000000" },
      weightLimit: DEST_WEIGHT,
    },
  },
]);

export const turingLocalTokensConfig: Record<string, ExtendedToken> = {
  TUR: {
    name: "TUR",
    symbol: "TUR",
    decimals: 10,
    ed: "100000000",
    toRaw: () => 0,
  },
  SBY: {
    name: "SBY",
    symbol: "SBY",
    decimals: 18,
    ed: "10000000000000000",
    toRaw: () => 4,
  },
  DEV: {
    name: "DEV",
    symbol: "DEV",
    decimals: 18,
    ed: "1",
    toRaw: () => 5,
  },
  MGR: {
    name: "MGR",
    symbol: "MGR",
    decimals: 18,
    ed: "0",
    toRaw: () => 1,
  },
};

export const turingLocalRouteConfigs = createRouteConfigs("turing-local", [
  {
    to: "shibuya",
    token: "TUR",
    xcm: {
      fee: { token: "TUR", amount: "2560000000" },
      weightLimit: "Unlimited",
    },
  },
]);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createBalanceStorages = (api: AnyApi) => {
  return {
    system: (address: string) =>
      Storage.create<any>({
        api,
        path: "query.system.account",
        params: [address],
      }),
    assets: (address: string, token: string) =>
      Storage.create<any>({
        api,
        path: "query.tokens.accounts",
        params: [address, token],
      }),
  };
};

class OakBalanceAdapter extends BalanceAdapter {
  private storages: ReturnType<typeof createBalanceStorages>;

  constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
    super({ api, chain, tokens });
    this.storages = createBalanceStorages(api);
  }

  public subscribeBalance(token: string, address: string): Observable<BalanceData> {
    if (!validateAddress(address)) throw new InvalidAddress(address);

    const tokenData: ExtendedToken = this.getToken(token);
    if (!tokenData) throw new TokenNotFound(token);

    if (token === this.nativeToken) {
      return this.storages.system(address).observable.pipe(
        map((result) => {
          const formattedData: BalanceData={
            free: result?.data?.free.sub(result?.data?.frozen),
            reserved: result?.data?.reserved,
            locked: result?.data?.frozen,
            available: result?.data?.free.add(result?.data?.reserved)
          }

          return {
            free: FN.fromInner(formattedData.free.toString(), tokenData.decimals),
            reserved: FN.fromInner(formattedData.reserved.toString(), tokenData.decimals),
            locked: FN.fromInner(formattedData.locked.toString(), tokenData.decimals),
            available: FN.fromInner(formattedData.available.toString(), tokenData.decimals),
          };
        }),
      );
    } else {
   
      return this.storages.assets(address, tokenData.toRaw()).observable.pipe(
        map((balance) => {
          return {
            free: FN.fromInner(balance.free?.toString(), this.decimals),
            locked: FN.fromInner(balance.frozen?.toString(), this.decimals),
            reserved: FN.fromInner(balance.reserved?.toString(), this.decimals),
            available: FN.fromInner(balance.free?.toString(), this.decimals),
          };
        }),
      );
    }
  }
}

class BaseOakAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: OakBalanceAdapter;

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    this.balanceAdapter = new OakBalanceAdapter({
      chain: this.chain.id as ChainId,
      api,
      tokens: this.tokens,
    });
  }

  public subscribeTokenBalance(token: string, address: string): Observable<BalanceData> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id);
    }

    return this.balanceAdapter.subscribeBalance(token, address);
  }

  public subscribeMaxInput(token: string, address: string, to: ChainId): Observable<FN> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id);
    }

    return combineLatest({
      txFee:
        token === this.balanceAdapter?.nativeToken
          ? this.estimateTxFee({
            amount: FN.ZERO,
            to,
            token,
            address,
            signer: address,
          })
          : "0",
      balance: this.balanceAdapter.subscribeBalance(token, address).pipe(map((i) => i.available)),
    }).pipe(
      map(({ balance, txFee }) => {
        const tokenMeta = this.balanceAdapter?.getToken(token);
        const feeFactor = 1.2;
        const fee = FN.fromInner(txFee, tokenMeta?.decimals).mul(new FN(feeFactor));

        // always minus ed
        return balance.minus(fee).minus(FN.fromInner(tokenMeta?.ed || "0", tokenMeta?.decimals));
      }),
    );
  }

  public createTx(params: TransferParams): SubmittableExtrinsic<"promise", ISubmittableResult> | SubmittableExtrinsic<"rxjs", ISubmittableResult> {
    return this.createXTokensTx(params);
  }
}
export class TuringAdapter extends BaseOakAdapter {
  constructor() {
    super(chains.turing, turingRouteConfigs, turingTokensConfig);
  }
}
export class TuringStagingAdapter extends BaseOakAdapter {
  constructor() {
    super(chains["turing-staging"], turingStagingRouteConfigs, turingStagingTokensConfig);
  }
}
export class TuringLocalAdapter extends BaseOakAdapter {
  constructor() {
    super(chains["turing-local"], turingLocalRouteConfigs, turingLocalTokensConfig);
  }
}
