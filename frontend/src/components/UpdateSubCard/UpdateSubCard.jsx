import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

  // 외부에서 스크랩해 온 상품 이미지(danuri.io)는 원본이 만료/삭제되면
  // 깨진 이미지 아이콘으로 그대로 노출된다. 로드 실패 시 스켈레톤으로 대체한다.
  if (!imageSrc || loadFailed) {
    return (
      <Skeleton
        className={`update-sub-card-skeleton ${className}`.trim()}
        containerClassName="update-sub-card-skeleton-container"
      />
    );
  }

  return (
    <img src={imageSrc} alt={alt} className={className} onError={() => setLoadFailed(true)} />
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
