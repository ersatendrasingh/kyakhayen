import { Img } from "@react-email/components";

interface CustomerMealPlanMailProps {
  subjectLine: string;
  name: string;
}

const CustomerMealPlanMail = ({
  subjectLine,
  name,
}: CustomerMealPlanMailProps) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  const mealPlanLink = `${domain}/meal-plan`;

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
          margin: "0 auto",
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
          {subjectLine}
        </h2>

        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          We are excited to inform you that your meal plan has been successfully
          generated!
        </p>

        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Click the button below to view your personalized meal plan:
        </p>

        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <a
            href={mealPlanLink}
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
            View Your Meal Plan
          </a>
        </div>

        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Thank you for choosing Kya Khayen. We hope you enjoy your meal plan
          and experience the benefits of a balanced diet.
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          If you have any questions or need assistance, feel free to reach out
          to our support team at{" "}
          <a href="mailto:mailtokyakhayen@gmail.com">
            mailtokyakhayen@gmail.com
          </a>{" "}
          .
        </p>

        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          We look forward to serving you again!
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

export default CustomerMealPlanMail;
