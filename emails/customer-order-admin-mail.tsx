import { Img } from "react-email";
import { getPublicMediaUrl } from "@/lib/s3utils";

interface CustomerOrderAdminMailProps {
  subjectLine: string;
  name: string;
  currency: string;
  email: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Failed" | "Processing";
  orderDetails?: {
    orderId: string;
    orderDate: string;
    items: {
      name: string;
      quantity: number;
      durationDays: number | null;
      priceInr: number;
      priceUsd: number;
    }[];
    subTotal: number;
    totalTax: number;
    totalAmount: number;
    coupon?: string;
    discount?: number;
  };
}

const CustomerOrderAdminMail = ({
  subjectLine,
  name,
  email,
  currency,
  phoneNumber,
  country,
  state,
  city,
  orderDetails = {
    orderId: "",
    orderDate: "",
    items: [],
    totalAmount: 0,
    subTotal: 0,
    totalTax: 0,
  },
  paymentMethod,
  paymentStatus,
}: CustomerOrderAdminMailProps) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "green";
      case "Cancelled":
        return "red";
      case "Failed":
        return "red";
      case "Processing":
        return "purple";
      default:
        return "black";
    }
  };
  const grandTotal =
    currency === "INR"
      ? orderDetails.subTotal + orderDetails.totalTax
      : orderDetails.subTotal;
  return (
    <div
      style={{
        background: "#f2f2f2",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "linear-gradient(to right, #ff0000, #ff7f00)",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "5px",
          paddingBottom: "5px",
          textAlign: "center",
          color: "white",
        }}
      >
        <a
          href="https://www.kyakhayen.com"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          <Img
            src={getPublicMediaUrl("others/kyakhayen-white-logo.png")}
            alt="Kya Khayen Logo"
            width={260}
            height={80}
            style={{ margin: "0px auto" }}
          />
        </a>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0px auto",
          padding: "20px",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
          Dear Admin!
        </h1>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "500",
            marginTop: "10px",
            color: "#555",
          }}
        >
          {subjectLine}
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Name:</strong> {name}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Email:</strong> {email}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Phone Number:</strong> {phoneNumber}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Country:</strong> {country}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>State:</strong> {state}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>City:</strong> {city}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Order at:</strong> {orderDetails?.orderDate}
        </p>

        {/* Order Details */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "500",
            marginTop: "20px",
            color: "#555",
          }}
        >
          Order Details
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Order ID:</strong> {orderDetails?.orderId}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Order Date:</strong> {orderDetails?.orderDate}
        </p>
        {/* Order Details */}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Plan
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Quantity
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Duration
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {item.name}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {`x${item.quantity}`}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {item.durationDays && item.durationDays > 1
                    ? `${item.durationDays} Days`
                    : `${item.durationDays || 0} Day`}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                    textAlign: "right",
                  }}
                >
                  {currency === "INR"
                    ? `${currency} ${item.priceInr.toFixed(2)}`
                    : `${currency} ${item.priceUsd.toFixed(2)}`}
                </td>
              </tr>
            ))}
            {currency === "INR" && (
              <>
                <tr style={{ textAlign: "right" }}>
                  <td
                    colSpan={3}
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      fontWeight: "bold",
                      borderTop: "1px solid #ddd",
                    }}
                  >
                    Sub Total:
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderTop: "1px solid #ddd",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  >
                    {`${currency} ${orderDetails.subTotal.toFixed(2)}`}
                  </td>
                </tr>
                <tr style={{ textAlign: "right" }}>
                  <td
                    colSpan={3}
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      fontWeight: "bold",
                      borderTop: "1px solid #ddd",
                    }}
                  >
                    Total Tax:
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderTop: "1px solid #ddd",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  >
                    {`${currency} ${orderDetails.totalTax.toFixed(2)}`}
                  </td>
                </tr>
              </>
            )}

            <tr style={{ textAlign: "right" }}>
              <td
                colSpan={3}
                style={{
                  padding: "10px",
                  textAlign: "right",
                  fontWeight: "bold",
                  borderTop: "1px solid #ddd",
                }}
              >
                Grand Total:
              </td>
              <td
                style={{
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {`${currency} ${grandTotal.toFixed(2)}`}
              </td>
            </tr>
            {orderDetails?.coupon && (
              <tr className="coupon" style={{ textAlign: "right" }}>
                <td
                  colSpan={3}
                  style={{
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  Coupon
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderTop: "1px solid #ddd",
                    fontWeight: "bold",
                    color: "purple",
                    textAlign: "right",
                  }}
                >
                  {orderDetails?.coupon}
                </td>
              </tr>
            )}

            {orderDetails?.discount && orderDetails.discount > 0 ? (
              <tr style={{ textAlign: "right" }}>
                <td
                  colSpan={3}
                  style={{
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  Discount
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderTop: "1px solid #ddd",
                    fontWeight: "bold",
                    color: "green",
                    textAlign: "right",
                  }}
                >
                  {`${currency} -  ${orderDetails.discount.toFixed(2)}`}
                </td>
              </tr>
            ) : null}

            <tr style={{ textAlign: "right" }}>
              <td
                colSpan={3}
                style={{
                  padding: "10px",
                  textAlign: "right",
                  fontWeight: "bold",
                  borderTop: "1px solid #ddd",
                }}
              >
                Total Amount:
              </td>
              <td
                style={{
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {`${currency} ${orderDetails.totalAmount.toFixed(2)}`}
              </td>
            </tr>
            <tr style={{ textAlign: "right" }}>
              <td
                colSpan={3}
                style={{
                  padding: "10px",
                  textAlign: "right",
                  fontWeight: "bold",
                  borderTop: "1px solid #ddd",
                }}
              >
                Payment Method:
              </td>
              <td
                style={{
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {paymentMethod}
              </td>
            </tr>
            <tr style={{ textAlign: "right" }}>
              <td
                colSpan={3}
                style={{
                  padding: "10px",
                  textAlign: "right",
                  fontWeight: "bold",
                  borderTop: "1px solid #ddd",
                }}
              >
                Payment Status:
              </td>
              <td
                style={{
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                  fontWeight: "bold",
                  color: getStatusColor(paymentStatus),
                  textAlign: "right",
                }}
              >
                {paymentStatus}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "linear-gradient(to right, #ff0000, #ff7f00)",
          padding: "20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <p>
          &copy; {new Date().getFullYear()} Kya Khayen. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default CustomerOrderAdminMail;
