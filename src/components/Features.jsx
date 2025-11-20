import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "./ProductCard";
import axios from "axios";
import { PuffLoader } from "react-spinners";

const Features = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/promotions/sections`);
        let fetchedSections = res.data.data || [];
        // Case-insensitive sort so "features" is always first
        fetchedSections = fetchedSections.sort((a, b) => {
          if (a.name?.toLowerCase() === "features") return -1;
          if (b.name?.toLowerCase() === "features") return 1;
          return 0;
        });
       
        setSections(fetchedSections);
        setTimeout(() => setLoading(false), 1000); // Optional: for loader effect
      } catch (error) {
        console.error("Failed to fetch promotion sections:", error);
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  return (
    <>
      {sections.map((section) => (
        <section key={section._id} className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-newPrimary mb-4">
                {section.name} Products
              </h2>
              {/* <p className="text-black text-lg">
                {section.name === "features"
                  ? "Discover our handpicked selection of premium products"
                  : section.name === "discount"
                  ? "Great deals on your favorite items"
                  : `Explore our ${section.name} products`}
              </p> */}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <PuffLoader />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.products.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
            <div className="text-center mt-12">
              <Link
                to={`/product-categories/${section.name.toLowerCase()}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                View All {section.name} Products
                <FaArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      ))}
    </>
  );
};

export default Features;