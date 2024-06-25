"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactFormSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserCountry } from "@/context/user-country-context";
import { useCallback, useEffect, useState } from "react";
import { City, Country, State } from "@/types/country-state-city";
import axios from "axios";
import { toast } from "react-toastify";

import { Button } from "../ui/button";

const ContactForm = () => {
  const { userCountry } = useUserCountry();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<Country | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countriesFetched, setCountriesFetched] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      country: "",
      state: "",
      city: "",
      query: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
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
      form.setValue("country", selectedCountry.name);
      fetchStates(selectedCountry.id);
    }
  }, [selectedCountry, form]);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    fetchStates(country.id);
  };

  const fetchStates = async (countryId: number) => {
    try {
      const response = await axios.post("/api/states", { countryId });
      const statesData = response.data;
      setStates(statesData);
      setSelectedState(null);
    } catch (error: any) {
      throw new Error("Error fetching states:", error);
    }
  };
  const fetchCities = async (stateId: number) => {
    try {
      const response = await axios.post("/api/cities", { stateId });
      const citiesData = response.data;
      setCities(citiesData);
    } catch (error: any) {
      throw new Error("Error fetching cities:", error);
    }
  };
  const handleStateChange = (state: State) => {
    setSelectedState(state);
    fetchCities(state.id);
    setSelectedCity(null);
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key !== "resumeFile") {
          formData.append(key, value);
        }
      });

      const response = await axios.post("/api/contact", formData);
      if (response.status === 200) {
        form.reset();
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);

        toast.success(response.data, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data || error.message);
        toast.error(error.response?.data || error.message, {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        console.error("Error:", error.message);
        toast.error(error.message, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  };
  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">Contact Us</h1>
      <div className="space-y-8 mt-2 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 my-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Full Name"
                        {...field}
                        className="w-full h-12 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
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
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 my-4">
              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
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
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 my-4">
              <FormField
                control={form.control}
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
                              selectedState
                                ? selectedState?.name
                                : "Select a state"
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
                control={form.control}
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
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        {...field}
                        placeholder="e.g. 'I want to know about meal plans'"
                        className="w-full h-32 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-end mt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Query"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ContactForm;
