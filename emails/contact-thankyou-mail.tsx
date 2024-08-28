import { Img } from "@react-email/components";
interface ContactThankyouMailProps {
  name: string;
}

const ContactThankyouMail = ({ name }: ContactThankyouMailProps) => {
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
          Greetings from Kya Khayen? Thank you for getting in touch with us.
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Thank you for contacting Kya Khayen?. We have received your message
          and our team will get back to you as soon as possible. We appreciate
          your interest in our platform and are excited to assist you with your
          query.
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px", color: "#666" }}>
          Meanwhile, feel free to browse through our extensive collection of
          recipes and meal plans tailored to suit your preferences and health
          goals. If you have any urgent queries, please don&apos;t hesitate to
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
          Thank you once again for reaching out to us. We look forward to
          assisting you.
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

      {/* Register for Free Section */}
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
          Register for Free
        </h2>
        <a href="https://www.kyakhayen.com/auth/register">
          <Img
            src="https://kyakhayen-prod.s3.ap-south-1.amazonaws.com/others/meal-plan.jpg"
            alt="Download Our App"
            width="100%"
            height="auto"
            style={{ maxWidth: "400px", margin: "20px auto" }}
          />
        </a>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Join Kya Khayen? today and get a personalized diet plan absolutely
          free for the first 15 days. Sign up now and start your journey towards
          a healthier lifestyle with tailor-made meal plans just for you!
        </p>
        <div>
          <a
            href="https://www.kyakhayen.com/auth/register"
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
            Sign Up Now
          </a>
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

export default ContactThankyouMail;
