import React from "react";
import { Award, Users, Leaf, Heart } from "lucide-react";
import image from "./../../IMAGE/paddy3.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About VILLFRESH
            </h1>
            <p className="text-xl text-green-100">
              Bringing you the finest organic products from farm to table with a
              commitment to health, quality, and sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, VILLFRESH began as a small family business with
                a simple mission: to provide premium organic rice, nuts, and
                seeds that promote healthy living. What started as a passion
                project has grown into a trusted brand serving health-conscious
                families across India.
              </p>
              <p className="text-gray-600 mb-4">
                We work directly with certified organic farmers in West Bengal
                and surrounding regions, ensuring that every product meets our
                stringent quality standards. Our commitment to sustainability
                and fair trade practices helps support local farming communities
                while delivering exceptional products to your table.
              </p>
              <p className="text-gray-600">
                Today, VILLFRESH is proud to be a leading supplier of organic
                Khilloin rice, premium nuts, and nutrient-rich seeds, all
                carefully selected and processed to retain their natural
                goodness.
              </p>
            </div>
            <div className="relative h-100 w-100 flex justify-center">
              <img
                src={image}
                alt="Organic farming"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything we do is guided by our core values, which shape our
              approach to sourcing, processing, and delivering our products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Organic Purity</h3>
              <p className="text-gray-600">
                100% certified organic products free from harmful chemicals and
                pesticides
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Rigorous quality control ensures only the finest products reach
                your table
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600">
                Supporting local farmers and communities through fair trade
                practices
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Health Focus</h3>
              <p className="text-gray-600">
                Promoting healthy living through nutritious, natural food
                products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch our story unfold and see how we bring the finest organic
              products from farm to your table.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="VILLFRESH Story"
                className="w-full h-96"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              To provide the highest quality organic rice, nuts, and seeds while
              supporting sustainable farming practices and promoting healthy
              living for families across India.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                <p className="text-gray-600">
                  We're committed to environmentally responsible practices that
                  protect our planet for future generations.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p className="text-gray-600">
                  Every product undergoes rigorous testing and quality control
                  to ensure it meets our high standards.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-gray-600">
                  We believe in building strong relationships with our farmers,
                  customers, and local communities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
