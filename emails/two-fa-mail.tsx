import { Img } from "@react-email/components";

interface TwoFAMailProps {
  name: string;
  code: string;
}

const TwoFAMail = ({ name, code }: TwoFAMailProps) => {
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
          padding: "20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <a
          href="https://www.kyakhayen.com"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          <Img
            src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/kyakhayen-white-logo.png"
            alt="Kya Khayen Logo"
            width={260}
            height={80}
            style={{ display: "block", margin: "0 auto" }}
          />
        </a>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "600px",
          margin: "20px auto",
          padding: "20px",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            textAlign: "left",
          }}
        >
          Dear {name}!
        </h1>
        <div
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            display: "inline-block",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "#555",
              marginBottom: "10px",
            }}
          >
            Your Two-Factor Authentication Code
          </h2>
          <div
            style={{
              background: "#ff7f00",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              display: "inline-block",
            }}
          >
            {code}
          </div>
          <p style={{ fontSize: "16px", marginTop: "20px", color: "#666" }}>
            If you did not request this code, please ignore this email or
            contact our support team.
          </p>
        </div>
      </div>
      {/* Download App Section */}
      <div
        style={{
          maxWidth: "600px",
          margin: "20px auto",
          padding: "20px",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
          Download Our App
        </h2>
        <a href="https://www.kyakhayen.com/download-app">
          <Img
            src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/download-app.jpg"
            alt="Download Our App"
            width="100%"
            height="auto"
            style={{ maxWidth: "400px", margin: "20px auto" }}
          />
        </a>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Discover culinary delights with Kya Khayen?. Get your ultimate
          mealtime companion. From personalized recipe recommendations to
          seamless organization and meal planning, Kya Khayen? simplifies the
          joy of home cooking.
        </p>
        <div>
          <a
            href="https://www.kyakhayen.com/download-app"
            style={{
              display: "inline-block",
              margin: "0 10px",
              padding: "10px 20px",
              background: "linear-gradient(to right, #ff0000, #ff7f00)",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            Download Now
          </a>
        </div>
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
        <p>&copy; 2024 Kya Khayen?. All rights reserved.</p>
        <h2
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
          }}
        >
          Follow Us
        </h2>
        <table
          style={{
            margin: "0 auto",
          }}
        >
          <tr>
            <td>
              <a
                href="https://www.facebook.com/mailtokyakhayen"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                <Img
                  src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/facebook.png"
                  alt="Facebook"
                  width={24}
                  height={24}
                  style={{ marginRight: "5px" }}
                />
              </a>
            </td>
            <td>
              <a
                href="https://twitter.com/kyakhayen"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                <Img
                  src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/x-icon.png"
                  alt="Twitter"
                  width={24}
                  height={24}
                  style={{ marginRight: "5px" }}
                />
              </a>
            </td>
            <td>
              <a
                href="https://www.instagram.com/kyakhayen/"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                <Img
                  src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/social.png"
                  alt="Instagram"
                  width={24}
                  height={24}
                  style={{ marginRight: "5px" }}
                />
              </a>
            </td>
            <td>
              <a
                href="https://www.youtube.com/channel/UC-kmoWXdqoZaUDSpemR2hCw"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                <Img
                  src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/youtube.png"
                  alt="YouTube"
                  width={24}
                  height={24}
                  style={{ marginRight: "5px" }}
                />
              </a>
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default TwoFAMail;
