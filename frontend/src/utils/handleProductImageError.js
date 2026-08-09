/**
 * 크롤링해 온 상품 이미지(img.danuri.io)는 한 페이지에서 여러 장을 동시에
 * 요청하면 CDN이 일시적으로 503을 반환한다(레이트 리밋 추정). 상품 상세
 * 페이지처럼 한두 장만 요청할 때는 문제없이 로드되는 것으로 확인됨.
 * 실패 시 짧은 지연을 두고 같은 주소로 최대 2번 재시도하고, 그래도
 * 실패하면 깨진 이미지 아이콘 대신 요소를 숨긴다.
 */
const MAX_IMAGE_RETRIES = 2;
const RETRY_DELAY_MS = 700;

export const handleProductImageError = (event) => {
  const img = event.currentTarget;
  const retryCount = Number(img.dataset.retryCount ?? "0");

  if (retryCount < MAX_IMAGE_RETRIES) {
    img.dataset.retryCount = String(retryCount + 1);
    const baseSrc = img.dataset.originalSrc ?? img.src;
    img.dataset.originalSrc = baseSrc;

    window.setTimeout(
      () => {
        const separator = baseSrc.includes("?") ? "&" : "?";
        img.src = `${baseSrc}${separator}retry=${Date.now()}`;
      },
      RETRY_DELAY_MS * (retryCount + 1),
    );
    return;
  }

  img.style.display = "none";
};
