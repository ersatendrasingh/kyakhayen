import axios from "axios";

export const exchangePrice = async (value: number, currency: string) => {
  if (!currency) return value;
  if (currency === "USD") return value;
  if (currency === "INR") return value;
  const exchangeResponse = await axios.get(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.NEXT_PUBLIC_FREE_CURRENCY_API_KEY}`
  );
  const exchangeRates = exchangeResponse.data.data;
  const userExchangeRate = exchangeRates[currency ? currency : "USD"];
  const exchangePrice = +(value * userExchangeRate).toFixed(2);

  return exchangePrice;
};
