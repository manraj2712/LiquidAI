export type Yield = "rewards" | "fee";

export type ProviderDetails = {
  id: string;
  name: string;
  logo: string;
  yield: Yield;
};
