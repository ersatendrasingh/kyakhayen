"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { string } from "zod";

const UserCountryContext = createContext({
  userCountry: null,
  userCurrency: "INR",
});

export const useUserCountry = () => useContext(UserCountryContext);

export const UserCountryProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [userCountry, setUserCountry] = useState(null);
  const [userCurrency, setUserCurrency] = useState("INR");

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const userCountry = data.country;
        const userCurrency = data.currency;
        setUserCountry(userCountry);
        setUserCurrency(userCurrency);
      } catch (error) {
        console.error("Error fetching current country:", error);
      }
    };

    fetchUserCountry();
  }, []);

  return (
    <UserCountryContext.Provider value={{ userCountry, userCurrency }}>
      {children}
    </UserCountryContext.Provider>
  );
};
