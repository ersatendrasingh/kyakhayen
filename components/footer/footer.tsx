import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import Container from "@/components/container";
import Logo from "@/components/logo";
import Copyrights from "@/components/footer/copyrights";

const Footer = () => {
  return (
    <footer className="pt-16 bg-gray-200">
      <Container>
        <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start md:text-left">
          <div className="max-w-[300px] py-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start md:items-start">
              <Logo />
            </div>
            <p className="mt-4">
              Unitus Health Academy, started by Dr Shikha Sharma, is an online
              platform to bring different health sciences under one umbrella and
              provide upskilling opportunities to health professionals and
              health enthusiasts.
            </p>
          </div>
          <div className="flex flex-col my-4 md:my-0">
            <h3 className="text-xl font-bold mb-3 text-center md:text-left">
              Quick Links
            </h3>
            <nav className="text-center md:text-left">
              <Link href="#" className="block mb-2">
                Terms And Conditions
              </Link>
              <Link href="#" className="block mb-2">
                Privacy Policy
              </Link>
              <Link href="#" className="block mb-2">
                Refund Policy
              </Link>
              <Link href="#" className="block mb-2">
                Contact
              </Link>
              <Link href="#" className="block mb-2">
                Raise your complaint
              </Link>
            </nav>
          </div>
          <div className="flex flex-col my-4 md:my-0">
            <h3 className="text-xl font-bold mb-3 text-center md:text-left">
              Popular Courses
            </h3>
            <nav className="text-center md:text-left">
              <Link href="#" className="block mb-2">
                Vedique Nutrition Professional Program
              </Link>
              <Link href="#" className="block mb-2">
                Personal Nutrition Course
              </Link>
              <Link href="#" className="block mb-2">
                Vedique Detoxification Course
              </Link>
              <Link href="#" className="block mb-2">
                Rainbow Nutrition for Balancing Chakras
              </Link>
              <Link href="#" className="block mb-2">
                Nutrition for Kids
              </Link>
            </nav>
          </div>
          <div className="flex flex-col my-4 md:my-0">
            <h3 className="text-xl font-bold mb-3 text-center md:text-left">
              Contact Us
            </h3>
            <p className="mb-2 text-center md:text-left">
              Phone: +91 9999 999 999
            </p>
            <p className="mb-2 text-center md:text-left">
              Email: 8Hbqg@example.com
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
              <a
                href="https://www.facebook.com/Dr.ShikhasNutriHealth"
                target="_blank"
                className="text-blue-500 hover:text-blue-700"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.youtube.com/@DrShikhasOneHealth"
                target="_blank"
                className="text-red-500 hover:text-red-700"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/nutrihealthsystems/"
                target="_blank"
                className="text-pink-500 hover:text-pink-700"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com/nutrihealthsys"
                target="_blank"
                className="text-blue-400 hover:text-blue-600"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/dr-shikha-s-nutriwel-085a8733/"
                target="_blank"
                className="text-blue-700 hover:text-blue-900"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </Container>
      <Copyrights />
    </footer>
  );
};

export default Footer;
