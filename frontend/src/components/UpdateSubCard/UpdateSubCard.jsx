import { useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { createImageErrorRetryHandler } from "@/utils/handleProductImageError";

const normalizeImageSrc = (src) => {
  const imageSrc = String(src ?? "").trim();

  if (!imageSrc || imageSrc.startsWith("http:///")) {
    return "";
  }

  return imageSrc;
};

const ImageOrSkeleton = ({ src, alt, className = "" }) => {
  const imageSrc = normalizeImageSrc(src);
  const [loadFailed, setLoadFailed] = useState(false);
  // 외부에서 스크랩해 온 상품 이미지(danuri.io)는 CDN이 일시적으로 503을
  // 반환하는 경우가 있어, 스켈레톤으로 대체하기 전에 먼저 재시도한다.
  const handleImageError = useMemo(
    () => createImageErrorRetryHandler(() => setLoadFailed(true)),
    [],
  );

  if (!imageSrc || loadFailed) {
    return (
      <Skeleton
        className={`update-sub-card-skeleton ${className}`.trim()}
        containerClassName="update-sub-card-skeleton-container"
      />
    );
  }

  return (
    <img src={imageSrc} alt={alt} className={className} loading="lazy" onError={handleImageError} />
  );
};

function UpdateSubCard({
  thumbnailImage,
  title,
  description,
  isActive = false,
  isPreview = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onChevronClick,
}) {
  const handleChevronClick = (event) => {
    event.stopPropagation();
    onChevronClick?.();
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onBlur?.();
    }
  };

  return (
    <article
      className={`sub_info ${isActive ? "is-active" : ""} ${isPreview ? "is-preview" : ""}`.trim()}
      role="listitem"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onFocus}
      onBlurCapture={handleBlur}
    >
      <button type="button" className="sub_info__content" onClick={onClick} aria-pressed={isActive}>
        <div className="sub_title">
          <div className="pakage_img_box">
            <ImageOrSkeleton src={thumbnailImage} alt={title} className="pakage_img" />
          </div>

          <div className="pakage_texts">
            <p className="title">{title}</p>
            <p className="gray_text">{description}</p>
          </div>
        </div>
      </button>

      <button
        type="button"
        className="chevron"
        aria-label={`${title} details`}
        onClick={handleChevronClick}
      >
        <svg viewBox="0 0 24 24">
          <path d="M9 5L16 12L9 19" />
        </svg>
      </button>
    </article>
  );
}

export default UpdateSubCard;
