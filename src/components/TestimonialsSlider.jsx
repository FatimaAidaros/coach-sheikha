import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './testimonials-slider.css';

export default function TestimonialsSlider({ items = [] }) {
  const [visibleItems, setVisibleItems] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);

  const touchStartX = useRef(0);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);

    return () => {
      window.removeEventListener('resize', updateVisibleItems);
    };
  }, []);

  const maxIndex = Math.max(0, items.length - visibleItems);

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = event => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = event => {
    const touchEndX = event.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;

    if (difference > 40) {
      goToNext();
    } else if (difference < -40) {
      goToPrevious();
    }
  };

  if (!items.length) return null;

  return (
    <div className="testimonials-slider-container">
      <div className="testimonials-slider-controls">

        <button
          type="button"
          className="testimonials-slider-arrow"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label="السابق"
        >
          <ChevronRight size={22} />
        </button>

        <div
          className="testimonials-slider-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonials-slider-track"
            style={{
              '--visible-items': visibleItems,
              transform: `translateX(calc(-${currentIndex} * ((100% + 20px) / ${visibleItems})))`
            }}
          >
            {items.map(testimonial => (
              <article
                key={testimonial.id}
                className="testimonial-card testimonials-slider-card"
              >
                <p className="testimonial-quote">
                  {testimonial.content}
                </p>

                <hr className="testimonial-divider" />

                <div className="testimonial-footer-row">
                  <div className="testimonial-avatar">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name || 'مشتركة'}
                      />
                    ) : (
                      <span>
                        {testimonial.name
                          ? testimonial.name.charAt(0)
                          : 'م'}
                      </span>
                    )}
                  </div>

                  <div className="testimonial-info">
                    <b>{testimonial.name}</b>

                    <div className="testimonial-stars">
                      {testimonial.rating || '★★★★★'}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="testimonials-slider-arrow"
          onClick={goToNext}
          disabled={currentIndex === maxIndex}
          aria-label="التالي"
        >
          <ChevronLeft size={22} />
        </button>

      </div>

      {maxIndex > 0 && (
        <div className="testimonials-slider-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={`testimonials-slider-dot ${
                index === currentIndex ? 'active' : ''
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`التعليقات ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}