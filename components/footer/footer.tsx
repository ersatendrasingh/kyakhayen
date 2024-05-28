import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import Container from "@/components/container";
import Logo from "@/components/logo";
import Copyrights from "@/components/footer/copyrights";
import { db } from "@/lib/db";

const Footer = async () => {
  const categories = await db.recipeCategories.findMany();

  return (
    <footer className="pt-16 bg-gray-200">
      <Container>
        <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start md:text-left">
          <div className="max-w-[300px] py-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start md:items-start">
              <Logo />
            </div>
            <p className="mt-4">
              At Kya Khayen, we believe in the joy of cooking and the pleasure
              of savoring delicious meals from around the world. Whether
              you&apos;re a seasoned chef or a novice in the kitchen, Kya Khayen
              is your go-to platform for discovering and sharing a wide variety
              of mouthwatering recipes.
            </p>
          </div>
          <div className="flex flex-col my-4 md:my-0">
            <h4 className="text-xl font-bold mb-3 text-center md:text-left">
              Quick Links
            </h4>
            <nav className="text-center md:text-left">
              <Link href="/" className="block mb-2">
                Home
              </Link>
              <Link href="/recipes" className="block mb-2">
                Recipes
              </Link>
              <Link href="/about-us" className="block mb-2">
                About
              </Link>
              <Link href="/download-app" className="block mb-2">
                Download App
              </Link>
              <Link href="/privacy-policy" className="block mb-2">
                Privacy Policy
              </Link>
            </nav>
          </div>
          <div className="flex flex-col my-4 md:my-0">
            <h5 className="text-xl font-bold mb-3 text-center md:text-left">
              Recipe Categories
            </h5>
            <nav className="text-center md:text-left">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/recipes?k=${category.slug}&type=category`}
                  className="block mb-2"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col my-4 md:my-0">
            <h6 className="text-xl font-bold mb-3 text-center md:text-left">
              Follow Us
            </h6>

            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
              <a
                href="https://www.facebook.com/mailtokyakhayen"
                target="_blank"
                className="text-blue-500 hover:text-blue-700"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.youtube.com/channel/UC-kmoWXdqoZaUDSpemR2hCw"
                target="_blank"
                className="text-red-500 hover:text-red-700"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/kyakhayen/"
                target="_blank"
                className="text-pink-500 hover:text-pink-700"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com/kyakhayen"
                target="_blank"
                className="text-black hover:text-blue-500"
              >
                <FaXTwitter className="w-6 h-6" />
              </a>
              {/* <a
                href="#"
                target="_blank"
                className="text-blue-700 hover:text-blue-900"
              >
                <FaLinkedin className="w-6 h-6" />
              </a> */}
            </div>
          </div>
        </div>
      </Container>
      <Copyrights />
    </footer>
  );
};

export default Footer;
