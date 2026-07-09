declare module "bakong-khqr" {
  export const khqrData: {
    currency: {
      khr: number;
      usd: number;
    };
    merchantType: {
      individual: string;
      merchant: string;
    };
  };

  export class IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      optional?: {
        currency?: number;
        amount?: number;
        billNumber?: string;
        mobileNumber?: string;
        storeLabel?: string;
        terminalLabel?: string;
        purposeOfTransaction?: string;
        expirationTimestamp?: number | string;
        merchantCategoryCode?: string;
        accountInformation?: string;
        acquiringBank?: string;
        languagePreference?: string;
        merchantNameAlternateLanguage?: string;
        merchantCityAlternateLanguage?: string;
        upiMerchantAccount?: string;
      }
    );
  }

  export class MerchantInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      merchantID: string,
      acquiringBank: string,
      optional?: Record<string, unknown>
    );
  }

  export class SourceInfo {
    constructor(
      appIconUrl: string,
      appName: string,
      appDeepLinkCallback: string
    );
  }

  export class BakongKHQR {
    generateIndividual(individualInfo: IndividualInfo): {
      status?: {
        code?: number;
        message?: string | null;
        errorCode?: number | null;
      };
      data?: {
        qr?: string;
        md5?: string;
      };
    };

    generateMerchant(merchantInfo: MerchantInfo): {
      status?: {
        code?: number;
        message?: string | null;
        errorCode?: number | null;
      };
      data?: {
        qr?: string;
        md5?: string;
      };
    };

    static decode(khqrString: string): unknown;
    static verify(khqrString: string): { isValid: boolean };
    static generateDeepLink(
      url: string,
      qr: string,
      sourceInfo?: SourceInfo
    ): Promise<unknown>;
    static checkBakongAccount(
      url: string,
      bakongID: string
    ): Promise<unknown>;
  }
}
