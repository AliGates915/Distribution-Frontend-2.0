import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

const ProductCard = ({ product }) => {
  const cardRef = useRef(null);
  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: "https://via.placeholder.com/300x200?text=No+Image" }];
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (images.length <= 1) return; // No need to rotate if only one image
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  const categoryString =
    product.category && product.category.length > 0
      ? product.category.map((cat) => cat.name).join(", ")
      : "N/A";

  const discount =
    typeof product.discountPercentage === "number" && product.discountPercentage > 0
      ? product.discountPercentage
      : null;

  return (
    <div ref={cardRef} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <Link to={`/products/${product._id}`}>
        <div className="relative">
          <img
            src={images[currentImage].url}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          {discount && (
            <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
              {discount}% OFF
            </span>
          )}
          {/* Dots for manual indication (optional) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentImage ? "bg-newPrimary" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
        <p className="text-newPrimary font-bold">${product.price}</p>
        <p className="text-gray-500">{categoryString}</p>
      </Link>
    </div>
  );
};

export default ProductCard;
