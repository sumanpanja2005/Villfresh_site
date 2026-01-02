import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const products = [
  {
    name: "Premium Khilloin Rice",
    description:
      "Organic, aromatic rice grown in the pristine valleys of West Bengal. Rich in nutrients and perfect for healthy meals.",
    price: 299,
    image:
      "https://pranishebashop.com.bd/public/uploads/all/N2i8UMHP15cdUNRxzRNw9mdkal9rZc6cSGqnZiwR.jpg",
    category: "rice",
    inStock: true,
    weight: "1kg",
    benefits: ["High in fiber", "Gluten-free", "Rich in antioxidants"],
  },
  {
    name: "Mixed Nuts Premium",
    description:
      "A perfect blend of almonds, cashews, pistachios, and walnuts. Roasted to perfection for maximum nutrition.",
    price: 450,
    image:
      "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop",
    category: "nuts",
    inStock: true,
    weight: "500g",
    benefits: ["High protein", "Heart healthy", "Rich in omega-3"],
  },
  {
    name: "Chia Seeds",
    description:
      "Nutrient-dense superfood seeds packed with omega-3 fatty acids, fiber, and plant-based protein.",
    price: 199,
    image:
      "https://cdn.pixabay.com/photo/2019/02/10/02/45/chiaseed-3986385_640.jpg",
    category: "seeds",
    inStock: true,
    weight: "250g",
    benefits: ["High in fiber", "Omega-3 rich", "Plant protein"],
  },
  {
    name: "Organic Almonds",
    description:
      "Raw, organic almonds sourced directly from certified farms. Perfect for snacking and cooking.",
    price: 399,
    image:
      "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop",
    category: "nuts",
    inStock: true,
    weight: "500g",
    benefits: ["Vitamin E rich", "Heart healthy", "High protein"],
  },
  {
    name: "Pumpkin Seeds",
    description:
      "Roasted pumpkin seeds with a delicious crunch. High in magnesium and zinc for overall wellness.",
    price: 179,
    image:
      "https://img.freepik.com/premium-photo/wooden-spoon-with-pumpkin-seeds-pumpkin-fruits-black-table_94064-1781.jpg?semt=ais_hybrid&w=740",
    category: "seeds",
    inStock: true,
    weight: "200g",
    benefits: ["High in magnesium", "Zinc rich", "Antioxidants"],
  },
  {
    name: "Basmati Rice Supreme",
    description:
      "Aged basmati rice with exceptional aroma and taste. Perfect for biryanis and special occasions.",
    price: 350,
    image:
      "https://cdn.create.vista.com/api/media/small/104734490/stock-photo-basmati-rice-with-a-spoon",
    category: "rice",
    inStock: true,
    weight: "1kg",
    benefits: ["Aged grain", "Low GI", "Aromatic"],
  },
  {
    name: "Sunflower Seeds",
    description:
      "Premium sunflower seeds packed with vitamin E and healthy fats. Great for heart health.",
    price: 149,
    image:
      "https://cdn.pixabay.com/photo/2016/02/21/15/45/sunflower-seed-1213766_1280.jpg",
    category: "seeds",
    inStock: true,
    weight: "250g",
    benefits: ["Vitamin E", "Healthy fats", "Antioxidants"],
  },
  {
    name: "Cashew Nuts Premium",
    description:
      "Creamy, buttery cashews perfect for snacking or adding to your favorite recipes.",
    price: 520,
    image:
      "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop",
    category: "nuts",
    inStock: true,
    weight: "500g",
    benefits: ["Heart healthy", "Rich in copper", "Healthy fats"],
  },
];

const seedProducts = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/villfresh";

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert products
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
