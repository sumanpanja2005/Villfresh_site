import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Wheat,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-green-600 p-1 rounded-full">
                {/* <Wheat className="h-6 w-6 text-white" /> */}
                <div className="bg-white p-1 rounded-full h-10 w-10 flex items-center justify-center">
                  <img
                    src="https://i.ibb.co/3q7Tkgc/IMG-20250712-WA0000.jpg"
                    alt="VILLFRESH Logo"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-2xl font-bold">VILLFRESH</span>
            </div>
            <p className="text-gray-300 mb-4">
              Pure from the Farm to Your Table. We bring you the finest organic
              rice, nuts, and seeds for a healthy lifestyle.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products?category=rice"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Rice
                </a>
              </li>
              <li>
                <a
                  href="/products?category=nuts"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Nuts
                </a>
              </li>
              <li>
                <a
                  href="/products?category=seeds"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Seeds
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">+91 9836007262</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">sumanpanja2005@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">West Bengal, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-300">
            © 2025 VILLFRESH. All rights reserved. | Made with ❤️ for healthy
            living
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
