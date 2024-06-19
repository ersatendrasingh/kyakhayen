import React from "react";

interface EmailTemplateProps {
  name: string;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({ name }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            backgroundImage: 'url("/unitus-logo.png")',
            backgroundSize: "cover",
            width: "200px",
            height: "100px",
            margin: "0 auto",
          }}
        />
        <h1 style={{ fontSize: "24px", marginTop: "20px" }}>Hi {name},</h1>
      </div>
      <div style={{ padding: "20px" }}>
        <p style={{ fontSize: "16px" }}>
          Welcome to our newsletter! We&apos;re excited to have you on board.
        </p>
        <p style={{ fontSize: "16px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "16px" }}>Follow us on social media:</p>
        <a
          href="https://example.com/facebook"
          style={{
            textDecoration: "none",
            color: "#000000",
            marginRight: "10px",
          }}
        >
          Facebook
        </a>
        <a
          href="https://example.com/twitter"
          style={{
            textDecoration: "none",
            color: "#000000",
            marginRight: "10px",
          }}
        >
          Twitter
        </a>
        <a
          href="https://example.com/instagram"
          style={{ textDecoration: "none", color: "#000000" }}
        >
          Instagram
        </a>
      </div>
    </div>
  );
};

export default EmailTemplate;
