import React, { useState } from "react";
import { Phone, Mail, MessageCircle, X } from "lucide-react";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Contact Options */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 w-64 animate-fade-in">
          <div className="space-y-3">
            <a
              href="tel:+919836007262"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">+91 9836007262</span>
            </a>
            <a
              href="mailto:sumanpanja2005@gmail.com"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">sumanpanja2005@gmail.com</span>
            </a>
            <a
              href="https://wa.me/919836007262"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default FloatingContact;
