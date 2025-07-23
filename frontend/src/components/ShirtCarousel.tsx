'use client';

import { useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from "next/image";
import { type Shirt } from '../lib/contractHooks';

interface ShirtCarouselProps {
  shirts: Shirt[];
  selectedShirt: Shirt;
  onShirtSelect: (shirt: Shirt) => void;
}

export default function ShirtCarousel({ shirts, selectedShirt, onShirtSelect }: ShirtCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, // Set to false and we'll handle looping manually
    dragFree: false,
    containScroll: 'trimSnaps',
    align: 'center',
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="carousel-container">
      <div className="carousel-controls">
        <button onClick={scrollPrev} className="carousel-button">&lt;</button>
        <span className="carousel-info">{shirts.length} Shirts Available</span>
        <button onClick={scrollNext} className="carousel-button">&gt;</button>
      </div>
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex" style={{ backfaceVisibility: 'hidden' }}>
          {/* Create a virtual loop by duplicating slides */}
          {shirts.map((shirt) => (
            <div 
              key={`pre-${shirt.id}`} 
              className={`shirt-card ${selectedShirt.id === shirt.id ? 'selected' : ''}`} 
              onClick={() => onShirtSelect(shirt)}
            >
              <div className="shirt-image-container">
                <Image 
                  src={shirt.image} 
                  alt={shirt.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 208px" 
                  className="shirt-image" 
                />
                <div className="shirt-id">ID: {shirt.id}</div>
              </div>
              <h3 className="shirt-name">{shirt.name}</h3>
              <p className="shirt-price">{shirt.price} ETH</p>
            </div>
          ))}
          {shirts.map((shirt) => (
            <div 
              key={shirt.id} 
              className={`shirt-card ${selectedShirt.id === shirt.id ? 'selected' : ''}`} 
              onClick={() => onShirtSelect(shirt)}
            >
              <div className="shirt-image-container">
                <Image 
                  src={shirt.image} 
                  alt={shirt.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 208px" 
                  className="shirt-image" 
                />
                <div className="shirt-id">ID: {shirt.id}</div>
              </div>
              <h3 className="shirt-name">{shirt.name}</h3>
              <p className="shirt-price">{shirt.price} ETH</p>
            </div>
          ))}
          {shirts.map((shirt) => (
            <div 
              key={`post-${shirt.id}`} 
              className={`shirt-card ${selectedShirt.id === shirt.id ? 'selected' : ''}`} 
              onClick={() => onShirtSelect(shirt)}
            >
              <div className="shirt-image-container">
                <Image 
                  src={shirt.image} 
                  alt={shirt.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 208px" 
                  className="shirt-image" 
                />
                <div className="shirt-id">ID: {shirt.id}</div>
              </div>
              <h3 className="shirt-name">{shirt.name}</h3>
              <p className="shirt-price">{shirt.price} ETH</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
