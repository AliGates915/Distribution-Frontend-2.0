import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const slideRef = useRef();
  const textRef = useRef();

  // Image from public/images folder
  const images = [
    "/images/1.png", 
    "/images/2.jpg",
    "/images/3.png",
    "/images/4.png",
    "/images/5.png",
    "/images/6.png",
  ];

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      setIsLoading(true);
      const loadPromises = images.map((src, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            setImagesLoaded(prev => ({ ...prev, [index]: true }));
            resolve();
          };
          img.onerror = () => {
            setImagesLoaded(prev => ({ ...prev, [index]: false }));
            resolve();
          };
          img.src = src;
        });
      });

      await Promise.all(loadPromises);
      setIsLoading(false);
    };

    preloadImages();
  }, []);

  // Auto-advance images every 4 seconds
  useEffect(() => {
    if (isLoading) return; // Don't auto-advance while loading
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length, isLoading]);

  useEffect(() => {
    if (isLoading) return; // Don't animate while loading

    // Fade out current slide
    gsap.to(slideRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        // Fade in new slide
        gsap.to(slideRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });

    // Animate text
    gsap.fromTo(
      textRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
    );
  }, [current, isLoading]);

  const nextSlide = () => {
    if (isLoading) return;
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (isLoading) return;
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newPrimary mx-auto mb-4"></div>
          <p className="text-newPrimary font-medium">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] overflow-hidden relative">
      <div
        className="relative w-full h-full"
        ref={slideRef}
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${images[current]}) no-repeat center 30%/cover`,
          userSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Background image with optimized loading */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${images[current]})`,
            backgroundSize: "cover",
            backgroundPosition: "center 60%",
            filter: "brightness(0.8)",
            opacity: imagesLoaded[current] ? 1 : 0,
          }}
        />
        
        {/* Loading overlay for current image */}
        {!imagesLoaded[current] && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-newPrimary"></div>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6">
          <h1
            ref={textRef}
            className="text-4xl md:text-5xl font-bold mb-4 text-center animate-pulse text-shadow-cyan"
          >
            Welcome to Wahid Foods SMC PVT.Ltd
          </h1>
          <p className="text-lg md:text-xl mb-8 text-center max-w-2xl">
            Discover the best products with unbeatable deals!
          </p>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300 z-10"
          disabled={isLoading}
          style={{ marginTop: '-20px' }}
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300 z-10"
          disabled={isLoading}
          style={{ marginTop: '-20px' }}
        >
          →
        </button>

        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;