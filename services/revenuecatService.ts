import {
  REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_IOS_API_KEY,
  REVENUECAT_PRO_ENTITLEMENT_ID,
} from "@/constants/env";
import { Platform } from "react-native";

type CustomerSnapshot = {
  activeEntitlementIds: string[];
  activeProductIds: string[];
  hasActiveEntitlement: boolean;
};

export type ProductPriceDetails = {
  localizedPrice: string;
  numericPrice: number | null;
};

class RevenueCatService {
  private configurePromise: Promise<void> | null = null;

  private isNativePlatform() {
    return Platform.OS === "ios" || Platform.OS === "android";
  }

  async configure() {
    if (!this.isNativePlatform()) return;
    if (this.configurePromise) return this.configurePromise;

    this.configurePromise = (async () => {
      const apiKey =
        Platform.OS === "ios"
          ? REVENUECAT_IOS_API_KEY
          : REVENUECAT_ANDROID_API_KEY;

      if (!apiKey) {
        throw new Error(
          "RevenueCat API key is missing. Set EXPO_PUBLIC_REVENUECAT_*_API_KEY.",
        );
      }

      const purchasesModule = await import("react-native-purchases");
      const Purchases = purchasesModule?.default;
      const { LOG_LEVEL } = purchasesModule;

      if (!Purchases || typeof Purchases.setLogLevel !== "function") {
        throw new Error(
          "RevenueCat native module is unavailable in this build. Use a custom dev build or EAS build with react-native-purchases installed and linked.",
        );
      }

      await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);
      Purchases.configure({ apiKey });
    })();

    try {
      await this.configurePromise;
    } catch (error) {
      this.configurePromise = null;
      throw error;
    }
  }

  async logIn(appUserId: string) {
    if (!this.isNativePlatform() || !appUserId) return;
    await this.configure();
    const { default: Purchases } = await import("react-native-purchases");
    if (!Purchases) {
      throw new Error(
        "RevenueCat native module is unavailable in this build. Use a custom dev build or EAS build.",
      );
    }
    await Purchases.logIn(appUserId);
  }

  async logOut() {
    if (!this.isNativePlatform()) return;
    await this.configure();
    const { default: Purchases } = await import("react-native-purchases");
    if (!Purchases) {
      throw new Error(
        "RevenueCat native module is unavailable in this build. Use a custom dev build or EAS build.",
      );
    }
    await Purchases.logOut();
  }

  async getCustomerSnapshot(): Promise<CustomerSnapshot> {
    if (!this.isNativePlatform()) {
      return {
        activeEntitlementIds: [],
        activeProductIds: [],
        hasActiveEntitlement: false,
      };
    }

    await this.configure();
    const { default: Purchases } = await import("react-native-purchases");
    if (!Purchases) {
      throw new Error(
        "RevenueCat native module is unavailable in this build. Use a custom dev build or EAS build.",
      );
    }
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = customerInfo?.entitlements?.active ?? {};
    const entries = Object.entries(activeEntitlements).filter(
      ([key, value]) => Boolean(key) && Boolean(value),
    );

    const activeEntitlementIds = entries.map(([key]) => key);
    const activeProductIds = entries
      .map(([, value]: [string, any]) =>
        typeof value?.productIdentifier === "string"
          ? value.productIdentifier
          : null,
      )
      .filter((id): id is string => Boolean(id));

    const hasProEntitlement = activeEntitlementIds.includes(
      REVENUECAT_PRO_ENTITLEMENT_ID,
    );

    return {
      activeEntitlementIds,
      activeProductIds,
      hasActiveEntitlement:
        hasProEntitlement || activeEntitlementIds.length > 0,
    };
  }

  async getLocalizedPricesForProductIds(productIds: string[]) {
    const details = await this.getProductPriceDetailsForProductIds(productIds);
    const localizedPrices: Record<string, string> = {};

    for (const [productId, value] of Object.entries(details)) {
      localizedPrices[productId] = value.localizedPrice;
    }

    return localizedPrices;
  }

  async getProductPriceDetailsForProductIds(productIds: string[]) {
    if (!this.isNativePlatform()) {
      return {} as Record<string, ProductPriceDetails>;
    }

    const uniqueIds = [...new Set(productIds.filter(Boolean))];
    if (!uniqueIds.length) {
      return {} as Record<string, ProductPriceDetails>;
    }

    await this.configure();
    const purchasesModule = await import("react-native-purchases");
    const Purchases = purchasesModule.default as any;

    if (!Purchases) {
      return {} as Record<string, ProductPriceDetails>;
    }

    const prices: Record<string, ProductPriceDetails> = {};

    try {
      // Prefer direct product lookups for strict product-id to price mapping.
      const products = await Purchases.getProducts(uniqueIds);
      for (const product of products ?? []) {
        const id = product?.identifier;
        const price = product?.priceString;
        const numericPrice = this.toNumericPrice(product?.price);
        if (typeof id === "string" && typeof price === "string") {
          prices[id] = {
            localizedPrice: price,
            numericPrice,
          };
        }
      }
    } catch {
      // Fall through to offerings-based lookup below.
    }

    if (Object.keys(prices).length > 0) {
      return prices;
    }

    return this.getProductPriceDetailsByProductId();
  }

  private async getProductPriceDetailsByProductId() {
    if (!this.isNativePlatform()) {
      return {} as Record<string, ProductPriceDetails>;
    }

    await this.configure();
    const { default: Purchases } = await import("react-native-purchases");
    if (!Purchases) {
      throw new Error(
        "RevenueCat native module is unavailable in this build. Use a custom dev build or EAS build.",
      );
    }
    const offerings = await Purchases.getOfferings();

    const prices: Record<string, ProductPriceDetails> = {};
    const allOfferings = offerings?.all ?? {};

    for (const offering of Object.values(allOfferings) as any[]) {
      const availablePackages = offering?.availablePackages ?? [];
      for (const pkg of availablePackages) {
        const productId = pkg?.product?.identifier;
        const localizedPrice = pkg?.product?.priceString;
        const numericPrice = this.toNumericPrice(pkg?.product?.price);

        if (
          typeof productId === "string" &&
          productId.length > 0 &&
          typeof localizedPrice === "string" &&
          localizedPrice.length > 0 &&
          !prices[productId]
        ) {
          prices[productId] = {
            localizedPrice,
            numericPrice,
          };
        }
      }
    }

    return prices;
  }

  private toNumericPrice(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  async purchaseProduct(productId: string) {
    if (!this.isNativePlatform()) {
      throw new Error("Purchases are only available on iOS/Android builds.");
    }
    if (!productId) {
      throw new Error("Missing product ID for selected plan.");
    }

    await this.configure();
    const { default: Purchases } = await import("react-native-purchases");
    if (!Purchases) {
      throw new Error(
        "RevenueCat native module is unavailable in this build. Use a custom dev build or EAS build.",
      );
    }

    try {
      const offerings = await Purchases.getOfferings();
      const allOfferings = offerings?.all ?? {};

      let targetPackage: any = null;
      for (const offering of Object.values(allOfferings) as any[]) {
        const availablePackages = offering?.availablePackages ?? [];
        for (const pkg of availablePackages) {
          if (pkg?.product?.identifier === productId) {
            targetPackage = pkg;
            break;
          }
        }
        if (targetPackage) break;
      }

      if (!targetPackage) {
        throw new Error(
          `Product not found in RevenueCat offerings: ${productId}`,
        );
      }

      await Purchases.purchasePackage(targetPackage);
      return { purchased: true as const };
    } catch (error: any) {
      if (error?.userCancelled) {
        return { purchased: false as const, userCancelled: true as const };
      }
      throw error;
    }
  }

  async restorePurchases() {
    if (!this.isNativePlatform()) {
      throw new Error("Restore is only available on iOS/Android builds.");
    }
    await this.configure();
    const { default: Purchases } = await import("react-native-purchases");
    await Purchases.restorePurchases();
  }
}

export const revenuecatService = new RevenueCatService();
