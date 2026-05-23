import { Img } from "react-email";
import { getPublicMediaUrl } from "@/lib/s3utils";
interface ContactAdminMailProps {
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  message: string;
  timestamp: string;
}

const ContactAdminMail = ({
  name,
  email,
  phoneNumber,
  country,
  state,
  city,
  message,
  timestamp,
}: ContactAdminMailProps) => {
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
          Someone has contacted you via Kya Khayen Website. Here are the
          details:
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
          <strong>Query:</strong> {message}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          <strong>Query received at:</strong> {timestamp}
        </p>
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
        <p>&copy; {new Date().getFullYear()} Kyakhayen. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ContactAdminMail;
