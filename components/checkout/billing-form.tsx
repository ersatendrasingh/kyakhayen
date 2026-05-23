import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { City, Country, State } from "@/types/country-state-city";
import { useUserCountry } from "@/context/user-country-context";

interface BillingFormProps {
  isSubmitting: boolean;
}

const BillingForm = ({ isSubmitting }: BillingFormProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<Country | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countriesFetched, setCountriesFetched] = useState(false);
  const { control, setValue } = useFormContext();
  const { userCountry } = useUserCountry();
  const getCurrentCountry = useCallback(async () => {
    try {
      const selectedCountry = countries.find(
        (country) => country.countryCode === userCountry
      );
      setSelectedCountry(
        selectedCountry !== undefined ? selectedCountry : null
      );
      setSelectedCountryCode(
        selectedCountryCode !== undefined ? selectedCountryCode : null
      );
    } catch (error) {
      console.error("Error fetching current country:", error);
    }
  }, [
    countries,
    userCountry,
    selectedCountryCode,
    setSelectedCountry,
    setSelectedCountryCode,
  ]);

  async function fetchStates(countryId: number) {
    try {
      const response = await axios.post("/api/states", { countryId });
      const statesData = response.data;
      setStates(statesData);
      setSelectedState(null);
    } catch (error: any) {
      throw new Error("Error fetching states:", error);
    }
  }

  async function fetchCities(stateId: number) {
    try {
      const response = await axios.post("/api/cities", { stateId });
      const citiesData = response.data;
      setCities(citiesData);
    } catch (error: any) {
      throw new Error("Error fetching cities:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/countries");
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
      setValue("country", selectedCountry.name);
      fetchStates(selectedCountry.id);
    }
  }, [selectedCountry, setValue]);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    fetchStates(country.id);
  };

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    fetchCities(state.id);
    setSelectedCity(null);
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };
  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">Please Enter Your Billing Details</h1>
      <div className="space-y-8 mt-8 w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="firstName"
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
            name="lastName"
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
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    type="email"
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
            name="phoneNumber"
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
            name="address"
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    key={selectedCountry?.countryCode}
                    onValueChange={(value) => {
                      const selectedCountry = countries.find(
                        (c) => c.countryCode === value
                      ) as Country;
                      handleCountryChange(selectedCountry);
                      field.onChange(selectedCountry.name);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue
                        placeholder={
                          selectedCountry
                            ? selectedCountry?.name
                            : "Select a country"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country: Country) => {
                        return (
                          <SelectItem
                            key={country.countryCode}
                            value={country.countryCode}
                          >
                            {country.name}
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
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const selectedState = states.find(
                        (s) => s.name === value
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
                          selectedState ? selectedState?.name : "Select a state"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state: State) => {
                        return (
                          <SelectItem key={state.id} value={state.name}>
                            {state.name}
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const selectedCity = cities.find(
                        (city) => city.name === value
                      ) as City;
                      handleCityChange(selectedCity);
                      field.onChange(value);
                    }}
                    disabled={!selectedState || isSubmitting}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue
                        placeholder={
                          selectedCity ? selectedCity.name : "Select a city"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city: City) => {
                        return (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
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
            name="zip"
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

export default BillingForm;
