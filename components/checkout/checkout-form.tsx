"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BillingForm from "@/components/checkout/billing-form";
import { Form } from "@/components/ui/form";
import CheckoutSummary from "./checkout-summary";
import { useForm, FormProvider } from "react-hook-form";
import { checkoutSchema } from "@/schemas";
import { useCurrentUser } from "@/hooks/use-current-user";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { CircleDashed } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUserCountry } from "@/context/user-country-context";
import { useEffect, useMemo, useState } from "react";
import { exchangePrice } from "@/lib/exchangePrice";
import { CartItem } from "@/types/cart-item";
import { AnimatePresence, motion } from "framer-motion";
import CouponCodeForm from "./coupon-code-form";
import AppliedCoupon from "./applied-coupon";

type AppliedCoupon = {
  code: string;
  calculatedDiscount: number;
  discountValue: number;
  discountType: "FIXED_PRODUCT" | "CART_PERCENTAGE";
  applicableProducts?: {
    id: string;
    name: string;
    priceInr: number;
    priceUsd: number;
  }[];
};
const CheckoutForm = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [showCoupon, setShowCoupon] = useState(false);
  const user = useCurrentUser();

  const router = useRouter();

  const { cartItems, emptyCart } = useCart();
  const { userCurrency, userCountry } = useUserCountry();
  const totalAmount =
    userCountry !== "IN"
      ? cartItems?.reduce(
          (total, item) => total + item.priceUsd! * item.quantity,
          0
        )
      : cartItems?.reduce(
          (total, item) => total + item.priceInr! * item.quantity,
          0
        );

  const [totalPrice, setTotalPrice] = useState(totalAmount);
  useEffect(() => {
    const appliedCoupon = localStorage.getItem("appliedCoupon");
    if (appliedCoupon) {
      setAppliedCoupon(JSON.parse(appliedCoupon));
    }
  }, []);
  useEffect(() => {
    const handlePriceExchange = async (price: number, userCurrency: string) => {
      try {
        const exchangedValue = await exchangePrice(price, userCurrency);
        setTotalPrice(exchangedValue);
      } catch (error) {
        console.error("Error exchanging price:", error);
        setTotalPrice(price);
      }
    };
    if (!userCountry) return;
    handlePriceExchange(totalAmount, userCurrency);
  }, [userCurrency, userCountry, totalAmount]);

  const calculateTotalTax = useMemo(() => {
    return cartItems?.length
      ? cartItems.reduce((totalTax, item) => {
          if (userCountry === "IN") {
            return totalTax + item.priceInr! * 0.18 * item.quantity;
          } else {
            return totalTax;
          }
        }, 0)
      : 0;
  }, [cartItems, userCountry]);

  const calculateTotalAmount = () => {
    return cartItems?.length
      ? userCountry !== "IN"
        ? cartItems.reduce(
            (total, item) => total + item.priceUsd! * item.quantity,
            0
          )
        : cartItems.reduce(
            (total, item) => total + item.priceInr! * item.quantity,
            0
          )
      : 0;
  };

  const subTotal =
    userCountry !== "IN" ? totalPrice : totalPrice - totalPrice * 0.18;

  const taxAmount = userCountry !== "IN" ? 0 : totalPrice * 0.18;

  const checkoutForm = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name ? user.name?.split(" ")[0] : "",
      lastName: user?.name ? user.name?.split(" ")[1] : "",
      email: user?.email ? user.email : "",
      phoneNumber: user?.phoneNumber ? user.phoneNumber : "",
      address: "",
      country: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const { isSubmitting, isValid } = checkoutForm.formState;

  const calculateDiscount = (
    item: CartItem,
    appliedCoupon?: AppliedCoupon
  ): number => {
    if (!appliedCoupon || !appliedCoupon.applicableProducts) return 0;

    const isApplicable = appliedCoupon.applicableProducts.some(
      (product) => product.id === item.id
    );
    if (!isApplicable) return 0;

    let discount = 0;

    if (appliedCoupon.discountType === "FIXED_PRODUCT") {
      discount =
        appliedCoupon.discountValue / appliedCoupon.applicableProducts.length;
    } else if (appliedCoupon.discountType === "CART_PERCENTAGE") {
      discount = (item.priceInr! * appliedCoupon.discountValue) / 100;
    }

    return discount;
  };

  const sendFailedEmail = async (
    orderId: string,
    paymentStatus: string,
    name: string,
    email: string,
    phoneNumber: string
  ) => {
    try {
      await axios.post("/api/razorpay/sendFailedEmail", {
        orderId,
        name,
        email,
        phoneNumber,
        paymentStatus,
      });
    } catch (error) {
      console.error("Error sending failed email:", error);
    }
  };

  const handlePaymentSubmit = async (
    values: z.infer<typeof checkoutSchema>
  ) => {
    try {
      const itemsDetails = cartItems?.map((item) => ({
        planId: item.id,
        title: item.name,
        quantity: item.quantity,
        priceInr: item.priceInr,
        priceUsd: item.priceUsd,
      }));
      const cartData = {
        subTotal,
        calculateTotalTax,
        totalPrice: appliedCoupon
          ? totalPrice - appliedCoupon?.calculatedDiscount
          : totalPrice,
        couponCode: appliedCoupon?.code,
        discount: appliedCoupon?.calculatedDiscount,
      };
      const formDataWithProducts = {
        ...values,
        ...cartData,
        items: itemsDetails,
        paymentMethod: "Razorpay",
        currency: userCurrency,
      };

      const checkoutResponse = await axios.post(
        "/api/checkout",
        formDataWithProducts
      );
      localStorage.removeItem("appliedCoupon");
      const checkoutData = checkoutResponse.data;
      if (!checkoutData) throw new Error("Checkout failed");
      // Handle successful checkout here
      if (checkoutData.paymentMethod === "Razorpay") {
        const res = await initializeRazorpay();

        if (!res) {
          throw new Error("Razorpay SDK Failed to load");
        }

        const razorpayData = {
          amount: checkoutData.totalAmount,
          currency: checkoutData.currency,
          orderId: checkoutData.id,
          name: values.firstName + " " + values.lastName,
          email: values.email,
          contact: values.phoneNumber,
          address: values.address,
          city: values.city,
          state: values.state,
          country: values.country,
          pincode: values.zip,
          planId: cartItems[0].id,
        };

        const response = await axios.post("/api/razorpay", razorpayData);

        const data = response.data;

        var options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          name: "Kya Khayen",
          currency: data.currency,
          amount: data.amount,
          order_id: data.id,
          description: "Thankyou for your interest in Kya Khayen",
          image: "./icons-512.png",
          notes: [
            {
              name: values.firstName + " " + values.lastName,
              email: values.email,
              contact: values.phoneNumber,
              address: values.address,
              city: values.city,
              state: values.state,
              country: values.country,
              pincode: values.zip,
              planId: cartItems[0].id,
            },
          ],
          handler: function (response: any) {
            if (response.razorpay_payment_id === null) {
              sendFailedEmail(
                checkoutData.id,
                "Cancelled",
                values.firstName + " " + values.lastName,
                values.email,
                values.phoneNumber
              );
              toast.error("Payment Cancelled", {
                duration: 5000,
              });
            } else if (
              response.error &&
              response.error.code === "payment_failed"
            ) {
              // Payment failed
              sendFailedEmail(
                checkoutData.id,
                "Failed",
                values.firstName + " " + values.lastName,
                values.email,
                values.phoneNumber
              );
              toast.error("Payment failed", {
                duration: 5000,
              });
            } else if (response.razorpay_payment_id) {
              emptyCart();
              router.push("/success?orderId=" + response.razorpay_order_id);
            } else {
              sendFailedEmail(
                checkoutData.id,
                "Cancelled",
                values.firstName + " " + values.lastName,
                values.email,
                values.phoneNumber
              );
              toast.error("Payment cancelled", {
                duration: 5000,
              });
            }
          },
          modal: {
            ondismiss: function () {
              sendFailedEmail(
                checkoutData.id,
                "Cancelled",
                values.firstName + " " + values.lastName,
                values.email,
                values.phoneNumber
              );
              toast.error("Payment Cancelled", {
                duration: 5000,
              });
            },
          },
          prefill: {
            name: values.firstName + " " + values.lastName,
            email: values.email,
            contact: values.phoneNumber,
          },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch {
      toast.error("Something went wrong while creating order", {
        duration: 5000,
      });
    }
  };
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };
  const handleApplyCoupon = (
    code: string,
    calculatedDiscount: number,
    discountValue: number,
    discountType: "FIXED_PRODUCT" | "CART_PERCENTAGE",
    applicableProducts?: {
      id: string;
      name: string;
      priceInr: number;
      priceUsd: number;
    }[]
  ) => {
    const appliedCoupon: AppliedCoupon = {
      code,
      calculatedDiscount,
      discountValue,
      discountType,
      applicableProducts,
    };
    localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    setAppliedCoupon(appliedCoupon);

    setCouponDiscount(calculatedDiscount);

    setTotalPrice(calculateTotalAmount() - couponDiscount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem("appliedCoupon");
    setTotalPrice(calculateTotalAmount);
  };
  const toggleShowCoupon = () => {
    setShowCoupon((prev) => !prev);
  };

  return (
    <div className="w-full pt-12 flex flex-col">
      <div className="w-full flex flex-col md:flex-row mt-8 mb-4 p-4 rounded-md shadow-sm transition bg-white">
        <span className="text-2xl font-bold">Have a coupon?</span>
        <Button
          onClick={toggleShowCoupon}
          variant="link"
          className="md:ml-2 px-0 md:px-2 md:mt-1 text-emerald-500 text-lg font-semibold inline-flex items-start justify-start"
          size="sm"
        >
          Click here to enter coupon
        </Button>
      </div>
      <AnimatePresence>
        {!appliedCoupon && showCoupon && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-md p-4 shadow-sm transition mb-4 mt-4"
          >
            <CouponCodeForm
              onApplyCoupon={handleApplyCoupon}
              cartItems={cartItems}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {appliedCoupon && (
        <div className="bg-white rounded-md p-4 mt-4 shadow-sm transition mb-4">
          <AppliedCoupon code={appliedCoupon.code} />
        </div>
      )}
      <FormProvider {...checkoutForm}>
        <Form {...checkoutForm}>
          <form onSubmit={checkoutForm.handleSubmit(handlePaymentSubmit)}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Left side: Billing Form */}
              <div className="w-full md:w-3/5">
                <BillingForm isSubmitting={isSubmitting} />
              </div>

              {/* Right side: Checkout Summary and Button */}

              <div className="w-full md:w-2/5 flex flex-col">
                <div className="bg-white rounded-md p-4 shadow-sm transition mb-4">
                  <CheckoutSummary
                    subTotal={subTotal}
                    grandTotal={totalPrice}
                    taxAmount={taxAmount}
                    appliedCoupon={appliedCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                  />
                </div>

                <div className="w-full mt-4">
                  <Button
                    className="w-full bg-websecondary hover:bg-gradient-to-r from-yellow-400 to-yellow-500 font-bold rounded-md p-6 shadow-sm transition overflow-hidden"
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    <span className="relative flex items-center">
                      <span className="transition-transform">
                        {isSubmitting ? (
                          <>
                            <div className="flex items-center">
                              <CircleDashed className="w-5 h-5 mr-2 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          </>
                        ) : (
                          "Proceed to Payment"
                        )}
                      </span>
                      <FaArrowRight className="ml-2 opacity-100 group-hover:opacity-0 duration-300 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
};

export default CheckoutForm;
