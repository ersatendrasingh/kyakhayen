import { Img } from "@react-email/components"; // Ensure Img component is correctly imported

interface EmailVerifiedMailProps {
  name: string;
}

const EmailVerifiedMail = ({ name }: EmailVerifiedMailProps) => {
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
            src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/kyakhayen-white-logo.png"
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
          Email Verification Successful
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Congratulations! Your email address has been successfully verified.
          Your account is now active, and you can log in to Kya Khayen? and
          start exploring.
        </p>

        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <a
            href="https://www.kyakhayen.com/auth/login"
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
            Login Now
          </a>
        </div>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Now you can enjoy full access to our platform and receive updates on
          exciting recipes, meal plans, and more!
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
      {/* Personalize Section */}
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
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          To kickstart your health journey with a completely FREE personalized
          7-day diet plan and mouth-watering recipes tailored to your tastes and
          health goals, please take a moment to complete your personalization.
          Your path to a healthier lifestyle begins with us!
        </p>
        <Img
          src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/free-offer.gif"
          alt="Free Offer"
          width="100%"
          height="auto"
          style={{ maxWidth: "150px", margin: "20px", marginLeft: "60px" }}
        />

        <a href="https://www.kyakhayen.com/">
          <Img
            src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/meal-plan.jpg"
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
          your personalized diet plan right away!
        </p>
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

export default EmailVerifiedMail;
