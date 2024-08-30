"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";

import Container from "@/components/container";
import PageTitle from "@/components/sections/page-title";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import OrderFeatureItem from "@/components/order-feature-item";

type Order = {
  id: string;
  email: string;
  orderId: string;
  subTotal: number;
  taxTotal?: number;
  totalAmount: number;
  coupon?: string;
  discount?: number;
  paymentMethod: string;
  currency: string;
  paymentStatus: string;
  items: {
    id: string;
    itemName: string;
    quantity: number;
    price: number;
    priceInr: number;
    item: {
      id: string;
      name: string;
      priceInr: number;
      priceUsd: number;
    };
  }[];
  createdAt: Date;
};

const SuccessPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const { emptyCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          throw new Error("Order ID not found");
        }
        const response = await axios.get(`/api/order/${orderId}`);
        const fetchedOrder = response.data;
        console.log("Fetch Order", response);
        if (
          fetchedOrder.paymentStatus === "Paid" ||
          fetchedOrder.paymentStatus === "Processing"
        ) {
          emptyCart();
        }
        setOrder(fetchedOrder);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Error fetching order details");
        router.push("/");
      }
    };

    fetchOrder();
  }, [orderId, router]);

  return (
    <div>
      <PageTitle title="Thank You" className="py-4" />
      <Container>
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg overflow-hidden my-20">
          <div className="w-full flex flex-col items-center px-6 py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative inline-block">
                <CircleCheckBig className="w-20 h-20 text-emerald-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full animate-ping absolute inset-0 border-4 border-emerald-500"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <h1 className="text-3xl font-bold mb-4">
                Your order has been placed
              </h1>
            </div>
            <div className="w-full flex items-center justify-center">
              {loading ? (
                <div className="w-full flex flex-col items-center">
                  <p className="text-lg mb-2">Loading order details...</p>
                  <Progress value={100} /> {/* Add the progress bar here */}
                </div>
              ) : (
                <div className="w-full">
                  <OrderFeatureItem title="Order ID" value={order?.orderId} />
                  <OrderFeatureItem title="Sub Total" value={order?.subTotal} />
                  {order?.currency === "INR" && (
                    <OrderFeatureItem title="Tax" value={order?.taxTotal} />
                  )}
                  {order?.coupon && (
                    <OrderFeatureItem
                      title="Coupon"
                      value={order?.coupon}
                      titleClassName="text-purple-500 font-bold"
                      valueClassName="text-purple-500 font-bold"
                    />
                  )}
                  {order?.discount && (
                    <OrderFeatureItem
                      title="Coupon Discount"
                      value={"-" + order?.discount}
                      titleClassName="text-emerald-500 font-bold"
                      valueClassName="text-emerald-500 font-bold"
                    />
                  )}
                  <OrderFeatureItem
                    title="Total Amount"
                    value={order?.totalAmount}
                    titleClassName="text-websecondary font-bold"
                    valueClassName="text-websecondary font-bold"
                  />
                  <OrderFeatureItem
                    title="Payment Method"
                    value={order?.paymentMethod}
                  />
                  <OrderFeatureItem
                    title="Payment Status"
                    value={order?.paymentStatus}
                  />
                  {order?.items && order?.items.length > 0 && (
                    <div className="w-full flex mx-2 my-4  border-b-2 border-gray-200 items-center justify-between">
                      <div className="w-1/2">
                        <span className="text-gray-600 font-bold mr-2">
                          Plan
                        </span>
                      </div>
                      <div className="w-1/2 text-end">
                        {order.items.map((item) => (
                          <Badge className="bg-emerald-500 mb-1" key={item.id}>
                            {item.itemName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center mt-4">
              <Link href="/meal-plan">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full bg-websecondary"
                >
                  Go to Meal Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SuccessPage;
