"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, useFormContext } from "react-hook-form";
import axios from "axios";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCallback, useEffect, useState } from "react";
import { City, Country, State } from "@/types/country-state-city";
import { useUserCountry } from "@/context/user-country-context";

interface ShippingFormProps {
  isSubmitting: boolean;
}

const ShippingForm = ({ isSubmitting }: ShippingFormProps) => {
  const { userCountry } = useUserCountry();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countriesFetched, setCountriesFetched] = useState(false);

  const { control, setValue } = useFormContext();

  const getCurrentCountry = useCallback(async () => {
    try {
      const selectedCountry = countries.find(
        (country) => country.country_code === userCountry
      );
      setSelectedCountry(
        selectedCountry !== undefined ? selectedCountry : null
      );
    } catch (error) {
      console.error("Error fetching current country:", error);
    }
  }, [countries, userCountry, setSelectedCountry]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://www.onehealthplatforms.com/access_api/countries.php"
        );
        const countries = response.data;
        setCountries(countries);
        setCountriesFetched(true);
      } catch (error: any) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (countriesFetched) {
      getCurrentCountry();
    }
  }, [countriesFetched, getCurrentCountry]);

  useEffect(() => {
    if (selectedCountry) {
      setValue("shipping_country", selectedCountry.country_name);
      fetchStates(selectedCountry.country_code);
    }
  }, [selectedCountry, setValue]);

  const handleCountryChange = (country: Country) => {
    console.log("Country selected:", country);

    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    fetchStates(country.country_code);
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await axios.get(
        `https://www.onehealthplatforms.com/access_api/region_code.php?country_code=${countryId}`
      );
      const statesData = response.data;
      setStates(statesData);
      setSelectedState(null);
    } catch (error: any) {
      throw new Error("Error fetching states:", error);
    }
  };
  const fetchCities = async (stateId: string) => {
    try {
      const response = await axios.get(
        `https://www.onehealthplatforms.com/access_api/city_code.php?region_code=${stateId}`
      );
      const citiesData = response.data;
      setCities(citiesData);
    } catch (error: any) {
      throw new Error("Error fetching cities:", error);
    }
  };
  const handleStateChange = (state: State) => {
    setSelectedState(state);
    fetchCities(state.region_code);
    setSelectedCity(null);
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };

  return (
    <div className="w-full flex flex-col items-start bg-white rounded-md p-4 shadow-sm transition justify-start">
      <h1 className="text-2xl font-bold">Shipping Address</h1>
      <div className="space-y-8 mt-8 w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="shipping_firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="First Name"
                    {...field}
                    className="w-full h-12 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shipping_lastName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Last Name"
                    {...field}
                    className="w-full h-12 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shipping_email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Email"
                    {...field}
                    className="w-full h-12 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shipping_phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Phone Number"
                    {...field}
                    className="w-full h-12 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="shipping_address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    disabled={isSubmitting}
                    {...field}
                    placeholder="e.g. 'House number, street name'"
                    className="w-full h-32 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="shipping_country"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    key={selectedCountry?.country_code}
                    onValueChange={(value) => {
                      const selectedCountry = countries.find(
                        (c) => c.country_code === value
                      ) as Country;
                      handleCountryChange(selectedCountry);
                      field.onChange(selectedCountry.country_name);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue
                        placeholder={
                          selectedCountry
                            ? selectedCountry?.country_name
                            : "Select a country"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country: Country) => {
                        return (
                          <SelectItem
                            key={country.country_code}
                            value={country.country_code}
                          >
                            {country.country_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shipping_state"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const selectedState = states.find(
                        (s) => s.region_code === value
                      ) as State;
                      handleStateChange(selectedState);
                      field.onChange(value);
                    }}
                    disabled={!selectedCountry || isSubmitting}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue
                        //placeholder="Select a state"
                        placeholder={
                          selectedState
                            ? selectedState?.region_code
                            : "Select a state"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state: State) => {
                        return (
                          <SelectItem
                            key={state.region_code}
                            value={state.region_code}
                          >
                            {state.region_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shipping_city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const selectedCity = cities.find(
                        (city) => city.city_name === value
                      ) as City;
                      handleCityChange(selectedCity);
                      field.onChange(value);
                    }}
                    disabled={!selectedState || isSubmitting}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue
                        placeholder={
                          selectedCity
                            ? selectedCity.city_name
                            : "Select a city"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city: City) => {
                        return (
                          <SelectItem
                            key={city.city_code}
                            value={city.city_name}
                          >
                            {city.city_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shipping_zip"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Zip"
                    {...field}
                    className="w-full h-12 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
