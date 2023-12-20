import { AnyApi, FixedPointNumber as FN, Token } from "@acala-network/sdk-core";
import { Observable, map, EMPTY } from "rxjs";
import { Storage } from "@acala-network/sdk/utils/storage";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { ApiNotFound, InvalidAddress, TokenNotFound } from "../errors";
import { BalanceData, BasicToken, ExtendedToken, TransferParams } from "../types";
import { createRouteConfigs } from "../utils";
import { validateEthereumAddress } from "../utils";

type TokenData = ExtendedToken & { toQuery: () => string };

export const moonbeamTokensConfig: Record<string, TokenData> = {
  GLMR: {
    name: "GLMR",
    symbol: "GLMR",
    decimals: 18,
    ed: "100000000000000000",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "0", // "0" means this is the chain’s native token
  },
};

export const moonriverTokensConfig: Record<string, TokenData> = {
  MOVR: {
    name: "MOVR",
    symbol: "MOVR",
    decimals: 18,
    ed: "1000000000000000",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "0", // "0" is a placeholder, the first element is nativeToken and retrieved different
  },
  xcCSM: {
    name: "Crust Shadow Native Token",
    symbol: "xcCSM",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "108457044225666871745333730479173774551",
  },
  xcSDN: {
    name: "Shiden",
    symbol: "xcSDN",
    decimals: 18,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "16797826370226091782818345603793389938",
  },
  xcHKO: {
    name: "HKO",
    symbol: "xcHKO",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "76100021443485661246318545281171740067",
  },
  xcKBTC: {
    name: "Kintsugi Wrapped BTC",
    symbol: "xcKBTC",
    decimals: 8,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "328179947973504579459046439826496046832",
  },
  xcXRT: {
    name: "Robonomics Native Token",
    symbol: "xcXRT",
    decimals: 9,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "108036400430056508975016746969135344601",
  },
  xcTUR: {
    name: "Turing Network",
    symbol: "xcTUR",
    decimals: 10,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "133300872918374599700079037156071917454",
  },
  xcKMA: {
    name: "Calamari",
    symbol: "xcKMA",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "213357169630950964874127107356898319277",
  },
  xcLIT: {
    name: "LIT",
    symbol: "xcLIT",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "65216491554813189869575508812319036608",
  },
  xcCRAB: {
    name: "Crab Parachain Token",
    symbol: "xcCRAB",
    decimals: 18,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "173481220575862801646329923366065693029",
  },
  xcPHA: {
    name: "Phala Token",
    symbol: "xcPHA",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "189307976387032586987344677431204943363",
  },
  xcvKSM: {
    name: "Bifrost Voucher KSM",
    symbol: "xcvKSM",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "264344629840762281112027368930249420542",
  },
  xcvBNC: {
    name: "Bifrost Voucher BNC",
    symbol: "xcvBNC",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "72145018963825376852137222787619937732",
  },
  xcaSeed: {
    name: "aSEED",
    symbol: "xcaSeed",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "214920334981412447805621250067209749032",
  },
  xcKINT: {
    name: "Kintsugi Native Token",
    symbol: "xcKINT",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "175400718394635817552109270754364440562",
  },
  xcPICA: {
    name: "Picasso",
    symbol: "xcPICA",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "167283995827706324502761431814209211090",
  },
  xcTEER: {
    name: "TEER",
    symbol: "xcTEER",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "105075627293246237499203909093923548958",
  },
  xcMGX: {
    name: "Mangata X Native Token",
    symbol: "xcMGX",
    decimals: 18,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "118095707745084482624853002839493125353",
  },
  xcvMOVR: {
    name: "Bifrost Voucher MOVR",
    symbol: "xcvMOVR",
    decimals: 18,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "203223821023327994093278529517083736593",
  },
  xcUSDT: {
    name: "Tether USD",
    symbol: "xcUSDT",
    decimals: 6,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "311091173110107856861649819128533077277",
  },
  xcRMRK: {
    name: "xcRMRK",
    symbol: "xcRMRK",
    decimals: 10,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "182365888117048807484804376330534607370",
  },
  xcKSM: {
    name: "xcKSM",
    symbol: "xcKSM",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "42259045809535163221576417993425387648",
  },
  xcKAR: {
    name: "Karura",
    symbol: "xcKAR",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "1081058159293365152112170237638664357",
  },
  xcBNC: {
    name: "xcBNC",
    symbol: "xcBNC",
    decimals: 12,
    ed: "0",
    toRaw: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
    toQuery: () => "319623561105283008236062145480775032445",
  },
};

export const moonriverRouteConfigs = createRouteConfigs("moonriver", [
  {
    to: "turing",
    token: "MOVR",
    xcm: {
      fee: { token: "MOVR", amount: "1000000000000000" },
      weightLimit: "Unlimited",
    },
  },
  {
    to: "turing",
    token: "TUR",
    xcm: {
      fee: { token: "TUR", amount: "2000000000" },
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
    assets: (tokenId: string, address: string) =>
      Storage.create<any>({
        api,
        path: "query.assets.account",
        params: [tokenId, address],
      }),
  };
};

class MoonbeamBalanceAdapter extends BalanceAdapter {
  private storages: ReturnType<typeof createBalanceStorages>;

  constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
    super({ api, chain, tokens });
    this.storages = createBalanceStorages(api);
  }

  public subscribeBalance(token: string, address: string): Observable<BalanceData> {
    // Return early if address is not a valid Ethereum address
    if (!validateEthereumAddress(address)) {
      return EMPTY;
    }

    const tokenData: TokenData = this.getToken(token);
    
    if (!tokenData) throw new TokenNotFound(token);

    if (tokenData.toQuery() === "0") {  // Native token
      // Interpret Native token
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
      // Interpret ERC20 tokens
      return this.storages.assets(tokenData.toQuery(), address).observable.pipe(
        map((balance) => {
          return {
            free: FN.fromInner(balance.unwrapOrDefault()?.balance?.toString(), tokenData.decimals),
            locked: new FN(0),
            reserved: new FN(0),
            available: FN.fromInner(balance.unwrapOrDefault()?.balance?.toString(), tokenData.decimals),
          };
        }),
      );
    }
  }
}

class BaseMoonbeamAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: MoonbeamBalanceAdapter;

  public subscribeTokenBalance(token: string, address: string): Observable<BalanceData> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id);
    }

    return this.balanceAdapter.subscribeBalance(token, address);
  }

  public async init(api: AnyApi) {
    this.api = api;
    const chain = this.chain.id as ChainId;

    this.balanceAdapter = new MoonbeamBalanceAdapter({
      chain,
      api,
      tokens: this.tokens,
    });
  }

  public subscribeMaxInput(_: string, __: string, ___: ChainId): Observable<FN> {
    throw new ApiNotFound(this.chain.id);
  }

  public createTx(_: TransferParams): SubmittableExtrinsic<"promise", ISubmittableResult> | SubmittableExtrinsic<"rxjs", ISubmittableResult> {
    throw new ApiNotFound(this.chain.id);
  }
}

export class MoonbeamAdapter extends BaseMoonbeamAdapter {
  constructor() {
    super(chains.moonbeam, [], moonbeamTokensConfig);
  }
}

export class MoonriverAdapter extends BaseMoonbeamAdapter {
  constructor() {
    super(chains.moonriver, moonriverRouteConfigs, moonriverTokensConfig);
  }
}
