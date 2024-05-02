export type Country = {
  id: number;
  name: string;
  countryCode: string;
  capital: string | null;
  region: string | null;
  currency: string | null;
  flag: string | null;
  phoneCode: string | null;
};

export type State = {
  id: number;
  name: string;
  stateCode: string;
  countryId: number;
};

export type City = {
  id: number;
  name: string;
  stateId: number;
};
