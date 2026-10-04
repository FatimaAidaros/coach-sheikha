import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Slider({
  items = [],
  renderItem,
  desktopItems = 3,
  tabletItems = 2,
  mobileItems = 1,
  gap = 20,
  className = ''
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(desktopItems);
  const [containerWidth, setContainerWidth] = useState(0);

  const viewportRef = useRef(null);
  const touchStartX = useRef(0);

  /* تحديد عدد البطاقات الظاهرة حسب حجم الشاشة */
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(mobileItems);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(tabletItems);
      } else {
        setVisibleCount(desktopItems);
      }
    };

    updateVisibleCount();

    window.addEventListener('resize', updateVisibleCount);

    return () => {
      window.removeEventListener('resize', updateVisibleCount);
    };
  }, [desktopItems, tabletItems, mobileItems]);

  /* قياس عرض الـ viewport */
  useEffect(() => {
    if (!viewportRef.current) return;

    const updateWidth = () => {
      setContainerWidth(viewportRef.current.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewportRef.current);

    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  /*
    آخر مكان مسموح للوصول إليه.

    مثال:
    2 شهادات + عرض 2 = maxIndex = 0
    3 شهادات + عرض 2 = maxIndex = 1
    4 شهادات + عرض 2 = maxIndex = 2
    5 شهادات + عرض 2 = maxIndex = 3

    وهكذا بدون تحديد عدد الشهادات.
  */
  const maxIndex = Math.max(
    0,
    items.length - visibleCount
  );

  /* إذا تغير عدد العناصر أو حجم الشاشة */
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      Math.min(maxIndex, prev + 1)
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      goNext();
    } else if (diff < -40) {
      goPrev();
    }
  };

  if (!items.length) {
    return null;
  }

  /*
    نحسب عرض كل بطاقة بالـ px الحقيقي.

    هذا مهم لأن عندنا gap بين البطاقات،
    وبالتالي النسبة المئوية وحدها لا تكفي.
  */
  const totalGap =
    gap * (visibleCount - 1);

  const cardWidth =
    visibleCount > 0
      ? (containerWidth - totalGap) / visibleCount
      : 0;

  /*
    مقدار الحركة عند الانتقال بطاقة واحدة.
    = عرض البطاقة + المسافة بينها وبين البطاقة التالية
  */
  const translateX =
    currentIndex * (cardWidth + gap);

  return (
    <div className={`custom-slider-container ${className}`}>
      <div className="slider-controls-wrapper">

        {/* السابق */}
        <button
          type="button"
          className="slider-arrow-btn prev-btn"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="السابق"
          title="السابق"
        >
          <ChevronRight size={22} />
        </button>

        {/* منطقة العرض */}
        <div
          className="slider-viewport"
          ref={viewportRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
         <div
  className="slider-track"
  style={{
    display: 'flex',
    flexWrap: 'nowrap',
    gap: `${gap}px`,
    transform: `translateX(-${
      currentIndex * (100 / visibleCount)
    }%)`,
    transition:
      'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
  }}
>
  {items.map((item, index) => (
    <div
      key={item.id || index}
      className="slider-slide"
      style={{
        flex: `0 0 calc(
          (100% - ${(visibleCount - 1) * gap}px)
          / ${visibleCount}
        )`,
        width: `calc(
          (100% - ${(visibleCount - 1) * gap}px)
          / ${visibleCount}
        )`,
        minWidth: `calc(
          (100% - ${(visibleCount - 1) * gap}px)
          / ${visibleCount}
        )`,
        boxSizing: 'border-box'
      }}
    >
      {renderItem(item, index)}
    </div>
  ))}
</div>
        </div>

        {/* التالي */}
        <button
          type="button"
          className="slider-arrow-btn next-btn"
          onClick={goNext}
          disabled={currentIndex === maxIndex}
          aria-label="التالي"
          title="التالي"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* النقاط */}
      {maxIndex > 0 && (
        <div className="slider-dots">
          {Array.from({
            length: maxIndex + 1
          }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={`slider-dot ${
                index === currentIndex
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setCurrentIndex(index)
              }
              aria-label={`الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}