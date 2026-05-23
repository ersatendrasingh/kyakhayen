import { Img } from "react-email";
import { getPublicMediaUrl } from "@/lib/s3utils";

interface RegisterThankyouMailProps {
  name: string;
  token: string;
}

const RegisterThankyouMail = ({ name, token }: RegisterThankyouMailProps) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
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
          Dear {name}!
        </h1>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "500",
            marginTop: "10px",
            color: "#555",
          }}
        >
          Greetings from Kya Khayen? Thank you for registering with us.
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          To complete your registration and activate your account, please verify
          your email address by clicking the button below:
        </p>
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <a
            href={confirmLink}
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "linear-gradient(to right, #ff0000, #ff7f00)",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Activate Your Account
          </a>
        </div>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          To get your personalized 7-day meal plan and recipes tailored to your
          tastes, favourite cuisines and ingredient exclusions, please complete
          your preferences.
        </p>

        <Img
          src={getPublicMediaUrl("others/free-offer.gif")}
          alt="Free Offer"
          width="100%"
          height="auto"
          style={{ maxWidth: "150px", margin: "20px", marginLeft: "60px" }}
        />
        <a href="https://www.kyakhayen.com/">
          <Img
            src={getPublicMediaUrl("others/meal-plan.jpg")}
            alt="Download Our App"
            width="100%"
            height="auto"
            style={{ maxWidth: "400px", margin: "20px auto" }}
          />
        </a>
        <div
          style={{
            margin: "0px auto",
            textAlign: "center",
          }}
        >
          <a
            href="https://www.kyakhayen.com/"
            style={{
              display: "inline-block",
              margin: "0 10px",
              padding: "10px 20px",
              background: "linear-gradient(to right, #ff0000, #ff7f00)",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            Personalize Now
          </a>
        </div>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Once you&apos;ve completed your personalization, we&apos;ll send you
          your personalized meal plan right away!
        </p>

        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          If you have any questions or need further assistance, feel free to
          reach out to us at{" "}
          <a
            href="mailto:mailtokyakhayen@gmail.com"
            style={{ color: "#ff8c00", textDecoration: "underline" }}
          >
            mailtokyakhayen@gmail.com
          </a>
          .
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          We look forward to supporting you on your journey to a healthier
          lifestyle.
        </p>
        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              margin: "0",
            }}
          >
            Thank you,
          </h2>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "500",
              marginTop: "5px",
              color: "#555",
            }}
          >
            Team Kya Khayen?
          </h3>
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
            src={getPublicMediaUrl("others/download-app.jpg")}
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
        <p>&copy; {new Date().getFullYear()} Kyakhayen. All rights reserved.</p>
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
                  src={getPublicMediaUrl("others/facebook.png")}
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
                  src={getPublicMediaUrl("others/x-icon.png")}
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
                  src={getPublicMediaUrl("others/social.png")}
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
                  src={getPublicMediaUrl("others/youtube.png")}
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

export default RegisterThankyouMail;
