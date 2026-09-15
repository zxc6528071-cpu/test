/**
 * ==========================================================================
 * 오늘의과일 (Daily Fresh Fruit Portfolio) 스크립트
 * - PRD v1.0 100% 호환 B2C 과일 커머스 시스템
 * - 1) 3단 할인 앵커링 & 실시간 타임세일 카운트다운
 * - 2) 품절(SOLD OUT) 흑백/스트라이프 및 재입고 알림, 재고임박 배지
 * - 3) 50,000원 이상 무료배송 4지점 실시간 연동
 * - 4) 4개 메뉴('Home', '상품목록', '장바구니', '주문 및 결제') 탭 네비게이션
 * ==========================================================================
 */

// 1. 비즈니스 설정 상수 (PRD 요건 2.3)
const SETTINGS = {
  FREE_SHIPPING_THRESHOLD: 50000, // 무료배송 기준금액 (50,000원)
  DEFAULT_SHIPPING_FEE: 3000,     // 기본 배송비 (3,000원)
};

// 2. 초기 과일 상품 데이터 (PRD 4장 데이터 모델 구조 준수)
const PRODUCTS_DATA = [
  {
    id: 1,
    name: "김천 고당도 샤인머스캣 2kg (3~4수)",
    category: "BERRY_GRAPE",
    description: "한 입 베어 물면 톡 터지는 과즙과 망고 향! 산지 직송 프리미엄 샤인머스캣",
    list_price: 52000,
    sale_price: 29900,
    stock_qty: 4, // 5개 이하 -> 마감임박 표시
    reserved_qty: 0,
    origin: "경북 김천",
    weight_g: 2000,
    sweetness_brix: 18.5,
    thumbnail_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: true,
    is_featured: true
  },
  {
    id: 2,
    name: "경북 안동 꿀 부사 사과 3kg (9~11과)",
    category: "APPLE_PEAR",
    description: "높은 일교차가 빚어낸 꽉 찬 꿀심과 아삭아삭한 식감의 안동 명품 사과",
    list_price: 38000,
    sale_price: 24700,
    stock_qty: 12,
    reserved_qty: 0,
    origin: "경북 안동",
    weight_g: 3000,
    sweetness_brix: 14.5,
    thumbnail_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: true,
    is_featured: true
  },
  {
    id: 3,
    name: "제주 서귀포 고당도 타이벡 감귤 3kg (로열과)",
    category: "CITRUS",
    description: "타이벡 농법으로 수분 조절을 극대화하여 진한 단맛과 산뜻한 산미",
    list_price: 26000,
    sale_price: 18900,
    stock_qty: 25,
    reserved_qty: 0,
    origin: "제주 서귀포",
    weight_g: 3000,
    sweetness_brix: 13.0,
    thumbnail_url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: false,
    is_featured: true
  },
  {
    id: 4,
    name: "항공직송 페루산 고당도 애플망고 4kg (8~10과)",
    category: "TROPICAL",
    description: "후숙될수록 붉은빛과 꿀 향기가 진해지는 프리미엄 항공직송 애플망고",
    list_price: 68000,
    sale_price: 36900, // 45% 할인 -> 41%+ 초특가 퍼플 뱃지
    stock_qty: 3, // 마감임박
    reserved_qty: 0,
    origin: "페루 항공직송",
    weight_g: 4000,
    sweetness_brix: 17.0,
    thumbnail_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: true,
    is_featured: true
  },
  {
    id: 5,
    name: "논산 청년농부 새벽수확 설향 딸기 1kg",
    category: "BERRY_GRAPE",
    description: "새벽 이슬을 맞고 자란 설향 딸기, 단단한 과육과 달콤한 향기 (당일 한정수량 완판)",
    list_price: 28000,
    sale_price: 19800,
    stock_qty: 0, // [PRD 2.2] 품절 테스트 상품
    reserved_qty: 0,
    origin: "충남 논산",
    weight_g: 1000,
    sweetness_brix: 12.8,
    thumbnail_url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",
    status: "SOLD_OUT",
    is_timesale: false,
    is_featured: false
  },
  {
    id: 6,
    name: "나주 특품 고당도 신고배 5kg (7~8과)",
    category: "APPLE_PEAR",
    description: "풍부한 과즙과 시원하고 달콤한 맛, 선물용으로도 손색없는 나주 특품 배",
    list_price: 45000,
    sale_price: 33700,
    stock_qty: 18,
    reserved_qty: 0,
    origin: "전남 나주",
    weight_g: 5000,
    sweetness_brix: 13.5,
    thumbnail_url: "https://images.unsplash.com/photo-1514756331096-242fdeb7004a?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: false,
    is_featured: true
  },
  {
    id: 7,
    name: "성주 참외 명장 꿀참외 3kg (9~11과)",
    category: "TROPICAL",
    description: "성주 맑은 물과 토양에서 자라 아삭한 육질과 속이 꽉 찬 달콤한 꿀참외",
    list_price: 34000,
    sale_price: 23800,
    stock_qty: 2, // 마감임박
    reserved_qty: 0,
    origin: "경북 성주",
    weight_g: 3000,
    sweetness_brix: 15.0,
    thumbnail_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: false,
    is_featured: false
  },
  {
    id: 8,
    name: "칠레 직수입 고당도 생체리 800g (Jumbo)",
    category: "BERRY_GRAPE",
    description: "검붉은 과육 속에 터지는 달콤함! 항공 직수입 최상급 점보 사이즈 (시즌 종료 품절)",
    list_price: 32000,
    sale_price: 24900,
    stock_qty: 0, // [PRD 2.2] 품절 테스트 상품
    reserved_qty: 0,
    origin: "칠레 항공직송",
    weight_g: 800,
    sweetness_brix: 19.0,
    thumbnail_url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80",
    status: "SOLD_OUT",
    is_timesale: false,
    is_featured: false
  },
  {
    id: 9,
    name: "제주 산지직송 카라향 만감류 2kg",
    category: "CITRUS",
    description: "봄철에만 맛볼 수 있는 진한 당도와 풍부한 과즙의 프리미엄 감귤",
    list_price: 30000,
    sale_price: 24000,
    stock_qty: 15,
    reserved_qty: 0,
    origin: "제주 서귀포",
    weight_g: 2000,
    sweetness_brix: 14.2,
    thumbnail_url: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: false,
    is_featured: false
  },
  {
    id: 10,
    name: "태국 직수입 남독마이 골드망고 2kg (4~5수)",
    category: "TROPICAL",
    description: "섬유질 없이 부드럽고 사르르 녹는 달콤한 과육, 남독마이 특선",
    list_price: 39000,
    sale_price: 31900,
    stock_qty: 14,
    reserved_qty: 0,
    origin: "태국 직송",
    weight_g: 2000,
    sweetness_brix: 16.5,
    thumbnail_url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600&auto=format&fit=crop&q=80",
    status: "ON_SALE",
    is_timesale: false,
    is_featured: false
  }
];

// 3. 상태 관리 (장바구니)
let cart = [];
let currentCategory = "ALL";
let currentSort = "discount";

// ==========================================================================
// 4. 유틸리티 함수
// ==========================================================================

// 금액 천단위 콤마 포맷팅 (정수 원화 표기)
function formatKRW(amount) {
  return Math.floor(amount).toLocaleString('ko-KR') + "원";
}

// [PRD 2.1] 할인율 계산: (1 - sale_price / list_price) * 100
function calculateDiscountRate(listPrice, salePrice) {
  if (!listPrice || listPrice <= salePrice) return 0;
  return Math.round(((listPrice - salePrice) / listPrice) * 100);
}

// [PRD 2.1] 뱃지 색상 구간 정의 (~20% 주황 / 21~40% 레드 / 41%+ 퍼플 + "초특가")
function getDiscountBadgeInfo(discountRate) {
  if (discountRate >= 41) {
    return { className: "purple", text: `${discountRate}% 초특가` };
  } else if (discountRate >= 21) {
    return { className: "red", text: `${discountRate}% OFF` };
  } else {
    return { className: "orange", text: `${discountRate}% OFF` };
  }
}

// 로컬 스토리지 동기화
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("daily_fruit_cart");
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("로컬스토리지 로드 실패:", e);
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem("daily_fruit_cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("로컬스토리지 저장 실패:", e);
  }
}

// 토스트 메시지 출력
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================================================
// 5. 네비게이션 및 라우팅 (4대 메뉴)
// ==========================================================================

function navigateTo(targetId) {
  // 모바일 메뉴 열려있으면 닫기
  const mainNav = document.getElementById("main-nav");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileOverlay = document.getElementById("mobile-nav-overlay");
  if (mainNav && mainNav.classList.contains("open")) {
    mainNav.classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (mobileOverlay) mobileOverlay.classList.remove("open");
  }

  // 모든 섹션 숨기기
  const sections = document.querySelectorAll(".page-section");
  sections.forEach(sec => sec.classList.remove("active"));

  // 타겟 섹션 활성화
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // 상단 네비게이션 활성 링크 상태 갱신
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    if (link.getAttribute("data-target") === targetId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 📱 하단 모바일 탭 네비게이션 활성 상태 갱신
  const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
  bottomNavItems.forEach(item => {
    if (item.getAttribute("data-target") === targetId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // URL 해시 업데이트 & 상단 스크롤
  window.location.hash = targetId;
  window.scrollTo({ top: 0, behavior: "smooth" });

  // 각 섹션 진입 시 동기화
  if (targetId === "cart") {
    renderCart();
  } else if (targetId === "checkout") {
    renderCheckoutPreview();
  }
}

function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      navigateTo(target);
    });
  });

  // 📱 하단 모바일 탭 네비게이션 클릭 이벤트
  const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
  bottomNavItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = item.getAttribute("data-target");
      navigateTo(target);
    });
  });

  // 로고 클릭 시 Home 이동
  const logo = document.getElementById("brand-logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("home");
    });
  }

  // 모바일 햄버거 토글 및 오버레이
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const mobileOverlay = document.getElementById("mobile-nav-overlay");
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (mobileOverlay) {
        mobileOverlay.classList.toggle("open", isOpen);
      }
    });
  }

  if (mobileOverlay && menuToggle && mainNav) {
    mobileOverlay.addEventListener("click", () => {
      mainNav.classList.remove("open");
      mobileOverlay.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  }

  // URL 해시 감지
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["home", "products", "cart", "checkout"].includes(hash)) {
      navigateTo(hash);
    }
  });

  // 초기 로드 시 해시 확인
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && ["home", "products", "cart", "checkout"].includes(initialHash)) {
    navigateTo(initialHash);
  } else {
    navigateTo("home");
  }
}

// ==========================================================================
// 6. 타임세일 카운트다운 타이머 (PRD 2.1)
// ==========================================================================

function initTimeSaleTimer() {
  // 오늘 밤 23:59:59 타임세일 마감 기준
  function updateTimer() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const diff = midnight - now;

    if (diff <= 0) {
      document.getElementById("timer-hours").textContent = "00";
      document.getElementById("timer-minutes").textContent = "00";
      document.getElementById("timer-seconds").textContent = "00";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    const hEl = document.getElementById("timer-hours");
    const mEl = document.getElementById("timer-minutes");
    const sEl = document.getElementById("timer-seconds");

    if (hEl && mEl && sEl) {
      hEl.textContent = pad(hours);
      mEl.textContent = pad(minutes);
      sEl.textContent = pad(seconds);
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================================================
// 7. 상품 카드 생성 및 렌더링 (PRD 2.1, 2.2, 2.3)
// ==========================================================================

function createProductCardHTML(product) {
  const isSoldOut = product.status === "SOLD_OUT" || product.stock_qty <= 0;
  const isLowStock = !isSoldOut && product.stock_qty <= 5;
  const discountRate = calculateDiscountRate(product.list_price, product.sale_price);
  const badgeInfo = getDiscountBadgeInfo(discountRate);

  // [PRD 2.2] 품절 시 뱃지 치환 / 일반 시 할인율 뱃지
  let badgeHTML = "";
  if (isSoldOut) {
    badgeHTML = `<span class="discount-badge sold-out-badge">품절</span>`;
  } else if (discountRate > 0) {
    badgeHTML = `<span class="discount-badge ${badgeInfo.className}">${badgeInfo.text}</span>`;
  }

  // [PRD 2.2] 품절 시 대각선 스트라이프 오버레이 + SOLD OUT
  let soldOutOverlayHTML = "";
  if (isSoldOut) {
    soldOutOverlayHTML = `
      <div class="sold-out-overlay" aria-hidden="true">
        <span class="sold-out-text">SOLD OUT</span>
      </div>
    `;
  }

  // [PRD 2.2] 재고 임박 (stock_qty <= 5) 배지
  let lowStockHTML = "";
  if (isLowStock) {
    lowStockHTML = `
      <div class="stock-warning-badge" title="서두르세요! 곧 품절됩니다.">
        <span>⏰ 마감임박 ${product.stock_qty}개 남음</span>
      </div>
    `;
  }

  // [PRD 2.2] 버튼: 일반 상품 -> 장바구니 담기 / 품절 상품 -> 재입고 알림 신청
  let actionButtonHTML = "";
  if (isSoldOut) {
    actionButtonHTML = `
      <button class="card-action-btn btn-restock-alert" onclick="openRestockModal(${product.id})">
        <span>🔔 재입고 알림 신청</span>
      </button>
    `;
  } else {
    actionButtonHTML = `
      <button class="card-action-btn btn-add-cart" onclick="addToCart(${product.id})">
        <span>🛒 장바구니 담기</span>
      </button>
    `;
  }

  return `
    <article class="product-card ${isSoldOut ? 'sold-out' : ''}" data-id="${product.id}">
      <div class="card-media">
        ${badgeHTML}
        ${soldOutOverlayHTML}
        ${lowStockHTML}
        <img src="${product.thumbnail_url}" alt="${product.name}" class="card-img" loading="lazy">
      </div>
      <div class="card-content">
        <div class="specs-row">
          <span class="spec-chip brix">당도 ${product.sweetness_brix} Brix</span>
          <span class="spec-chip">${product.weight_g >= 1000 ? (product.weight_g / 1000) + 'kg' : product.weight_g + 'g'}</span>
        </div>
        <h3 class="product-name" title="${product.name}">${product.name}</h3>
        <p class="product-origin">산지: ${product.origin}</p>

        <!-- [PRD 2.1] 3단 가격 앵커링: 정가(취소선) -> 판매가(굵은 빨강 강조) -->
        <div class="price-anchoring-box">
          <del class="list-price">${formatKRW(product.list_price)}</del>
          <div class="price-main-line">
            <strong class="sale-price">${formatKRW(product.sale_price)}</strong>
            <span class="unit-label">/ 무료배송 혜택</span>
          </div>
        </div>

        <!-- [PRD 2.3] ② 상품 카드 무료배송 뱃지 노출 -->
        <div class="shipping-perk">
          <span>🚚 5만원 이상 주문 시 무료배송</span>
        </div>

        ${actionButtonHTML}
      </div>
    </article>
  `;
}

// [PRD 2.2] 품절 상품 자동 후순위 배치 정렬 함수
function sortProductsWithSoldOutLast(list, sortKey) {
  return [...list].sort((a, b) => {
    const aSold = (a.status === "SOLD_OUT" || a.stock_qty <= 0);
    const bSold = (b.status === "SOLD_OUT" || b.stock_qty <= 0);

    // 품절 상품은 항상 목록 최하단으로 정렬
    if (aSold && !bSold) return 1;
    if (!aSold && bSold) return -1;

    // 품절 여부가 동일할 때 기준 정렬
    if (sortKey === "discount") {
      const aRate = calculateDiscountRate(a.list_price, a.sale_price);
      const bRate = calculateDiscountRate(b.list_price, b.sale_price);
      return bRate - aRate;
    } else if (sortKey === "price-asc") {
      return a.sale_price - b.sale_price;
    } else if (sortKey === "price-desc") {
      return b.sale_price - a.sale_price;
    } else if (sortKey === "popular") {
      return b.sweetness_brix - a.sweetness_brix;
    } else if (sortKey === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });
}

// 상품 목록 렌더링
function renderAllProducts() {
  const container = document.getElementById("all-products-grid");
  if (!container) return;

  // 1) 카테고리 필터링
  let filtered = PRODUCTS_DATA;
  if (currentCategory !== "ALL") {
    filtered = PRODUCTS_DATA.filter(p => p.category === currentCategory);
  }

  // 2) 품절 후순위 정렬 적용
  const sorted = sortProductsWithSoldOutLast(filtered, currentSort);

  if (sorted.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: #64748b;">
        <p style="font-size: 2rem; margin-bottom: 8px;">🍎</p>
        <p>해당 카테고리의 과일 상품이 없습니다.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = sorted.map(createProductCardHTML).join("");
}

// 홈 섹션 타임세일 및 추천 상품 렌더링
function renderHomeSections() {
  const timesaleGrid = document.getElementById("timesale-products-grid");
  const featuredGrid = document.getElementById("home-featured-grid");

  if (timesaleGrid) {
    const timesaleList = PRODUCTS_DATA.filter(p => p.is_timesale);
    const sortedTimesale = sortProductsWithSoldOutLast(timesaleList, "discount");
    timesaleGrid.innerHTML = sortedTimesale.map(createProductCardHTML).join("");
  }

  if (featuredGrid) {
    const featuredList = PRODUCTS_DATA.filter(p => p.is_featured);
    const sortedFeatured = sortProductsWithSoldOutLast(featuredList, "discount");
    featuredGrid.innerHTML = sortedFeatured.slice(0, 4).map(createProductCardHTML).join("");
  }
}

// 카테고리 탭 이벤트 설정
function initCategoryTabs() {
  const tabs = document.querySelectorAll(".category-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.getAttribute("data-category");
      renderAllProducts();
    });
  });
}

// 정렬 변경 이벤트 핸들러
function handleSortChange(val) {
  currentSort = val;
  renderAllProducts();
}

// ==========================================================================
// 8. 장바구니 및 무료배송 4지점 연동 (PRD 2.3)
// ==========================================================================

// 장바구니 상품 추가
function addToCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  if (product.status === "SOLD_OUT" || product.stock_qty <= 0) {
    showToast("품절된 상품입니다. 재입고 알림을 신청해 주세요.", "info");
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty + 1 > product.stock_qty) {
      showToast(`남은 재고(${product.stock_qty}개) 이상 담을 수 없습니다.`, "info");
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      sale_price: product.sale_price,
      list_price: product.list_price,
      thumbnail_url: product.thumbnail_url,
      qty: 1,
      stock_qty: product.stock_qty,
      selected: true
    });
  }

  saveCartToStorage();
  updateCartBadge();
  showToast(`[${product.name}] 장바구니에 담았습니다!`);
}

// 장바구니 수량 변경
function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeCartItem(productId);
    return;
  }

  if (newQty > item.stock_qty) {
    showToast(`남은 재고(${item.stock_qty}개)를 초과할 수 없습니다.`, "info");
    return;
  }

  item.qty = newQty;
  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

// 장바구니 아이템 삭제
function removeCartItem(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage();
  renderCart();
  updateCartBadge();
  showToast("선택한 상품이 장바구니에서 삭제되었습니다.");
}

// 선택 항목 삭제
function removeSelectedCartItems() {
  const selectedCount = cart.filter(i => i.selected).length;
  if (selectedCount === 0) {
    showToast("삭제할 상품을 선택해 주세요.", "info");
    return;
  }

  cart = cart.filter(i => !i.selected);
  saveCartToStorage();
  renderCart();
  updateCartBadge();
  showToast(`${selectedCount}개 상품이 삭제되었습니다.`);
}

// 전체 선택 토글
function toggleSelectAllItems(checked) {
  cart.forEach(i => i.selected = checked);
  saveCartToStorage();
  renderCart();
}

// 개별 선택 토글
function toggleItemSelect(productId, checked) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.selected = checked;
    saveCartToStorage();
    renderCart();
  }
}

// 헤더 및 모바일 하단바 장바구니 뱃지 카운트 동기화
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  const mobileBadge = document.getElementById("mobile-cart-count");
  const totalCount = cart.reduce((acc, cur) => acc + cur.qty, 0);

  if (badge) {
    badge.textContent = totalCount;
  }
  if (mobileBadge) {
    mobileBadge.textContent = totalCount;
  }
}

// [PRD 2.3] 장바구니 렌더링 & 무료배송 게이지 및 금액 계산
function renderCart() {
  const container = document.getElementById("cart-items-container");
  const gaugeCard = document.getElementById("cart-shipping-gauge");
  const gaugeStatusText = document.getElementById("gauge-status-text");
  const gaugeIcon = document.getElementById("gauge-icon");
  const progressFill = document.getElementById("shipping-progress-fill");
  const currentText = document.getElementById("gauge-current-text");
  const targetText = document.getElementById("gauge-target-text");

  if (!container) return;

  // 빈 장바구니 처리
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-view">
        <div class="empty-cart-icon">🛒</div>
        <h3>장바구니가 비어 있습니다.</h3>
        <p>오늘 수확한 신선한 과일을 장바구니에 담아보세요!</p>
        <button class="btn btn-primary" style="margin-top: 18px;" onclick="navigateTo('products')">
          신선 과일 둘러보기
        </button>
      </div>
    `;

    // 게이지 초기화
    if (progressFill) progressFill.style.width = "0%";
    if (gaugeStatusText) gaugeStatusText.textContent = "50,000원 이상 구매 시 배송비(3,000원) 전액 무료!";
    if (gaugeCard) gaugeCard.classList.remove("achieved");
    if (currentText) currentText.textContent = "현재 담은 금액: 0원";

    updateSummaryUI(0, 0, 0, 0);
    return;
  }

  // 선택된 상품 기준 계산
  const selectedItems = cart.filter(i => i.selected);
  const subtotal = selectedItems.reduce((acc, i) => acc + (i.sale_price * i.qty), 0);
  const listTotal = selectedItems.reduce((acc, i) => acc + (i.list_price * i.qty), 0);
  const discountTotal = listTotal - subtotal;

  // 🚚 [PRD 2.3 - ③] 무료배송 달성 여부 및 게이지 바 계산
  const threshold = SETTINGS.FREE_SHIPPING_THRESHOLD;
  const isFreeShipping = subtotal >= threshold;
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const diff = threshold - subtotal;

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  if (currentText) {
    currentText.textContent = `현재 담은 금액: ${formatKRW(subtotal)}`;
  }
  if (targetText) {
    targetText.textContent = `무료배송 기준: ${formatKRW(threshold)}`;
  }

  if (isFreeShipping) {
    // 달성 완료 상태
    gaugeCard.classList.add("achieved");
    if (gaugeIcon) gaugeIcon.textContent = "🎉";
    if (gaugeStatusText) {
      gaugeStatusText.innerHTML = `<strong>무료배송 적용 완료!</strong> 배송비 ${formatKRW(SETTINGS.DEFAULT_SHIPPING_FEE)}원이 전액 할인되었습니다.`;
    }
  } else {
    // 미달 상태
    gaugeCard.classList.remove("achieved");
    if (gaugeIcon) gaugeIcon.textContent = "🚚";
    if (gaugeStatusText) {
      gaugeStatusText.innerHTML = `<strong>${formatKRW(diff)}</strong> 더 담으면 <span style="color:#0284c7; font-weight:800;">무료배송!</span> (기본 배송비 ${formatKRW(SETTINGS.DEFAULT_SHIPPING_FEE)})`;
    }
  }

  // 장바구니 아이템 리스트 HTML
  container.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-id="${item.id}">
      <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="toggleItemSelect(${item.id}, this.checked)">
      <img src="${item.thumbnail_url}" alt="${item.name}" class="cart-thumb">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-prices">
          <del class="list-price">${formatKRW(item.list_price)}</del>
          <strong class="sale-price" style="font-size: 1rem;">${formatKRW(item.sale_price)}</strong>
        </div>
      </div>
      <div class="qty-stepper">
        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
      </div>
      <div class="cart-item-subtotal">
        ${formatKRW(item.sale_price * item.qty)}
      </div>
      <button class="btn-remove-item" onclick="removeCartItem(${item.id})" title="삭제">✕</button>
    </div>
  `).join("");

  // 전체 선택 체크박스 및 카운트 동기화
  const checkAll = document.getElementById("check-all-items");
  const selCount = document.getElementById("selected-items-count");
  const totCount = document.getElementById("total-items-count");
  if (checkAll) checkAll.checked = cart.length > 0 && cart.every(i => i.selected);
  if (selCount) selCount.textContent = selectedItems.length;
  if (totCount) totCount.textContent = cart.length;

  // 요약 금액 갱신
  const shippingFee = (subtotal === 0 || isFreeShipping) ? 0 : SETTINGS.DEFAULT_SHIPPING_FEE;
  const finalTotal = subtotal + shippingFee;
  updateSummaryUI(listTotal, discountTotal, shippingFee, finalTotal, isFreeShipping, selectedItems.length);
}

// 장바구니 요약 UI 갱신 (PRD 2.3 - ④ 배송비 0원 취소선 처리)
function updateSummaryUI(listTotal, discountTotal, shippingFee, finalTotal, isFreeShipping, selectedCount) {
  const elList = document.getElementById("summary-list-total");
  const elDisc = document.getElementById("summary-discount-total");
  const elShip = document.getElementById("summary-shipping-fee");
  const elFinal = document.getElementById("summary-final-total");
  const btnCount = document.getElementById("btn-checkout-count");
  const btnProceed = document.getElementById("btn-proceed-checkout");

  if (elList) elList.textContent = formatKRW(listTotal);
  if (elDisc) elDisc.textContent = `-${formatKRW(discountTotal)}`;
  if (elFinal) elFinal.textContent = formatKRW(finalTotal);
  if (btnCount) btnCount.textContent = selectedCount || 0;
  if (btnProceed) {
    btnProceed.disabled = (selectedCount === 0);
  }

  // 🚚 [PRD 2.3 - ④] 결제 금액 요약: 배송비 항목 3,000원 -> 0원 취소선 처리
  if (elShip) {
    if (isFreeShipping && listTotal > 0) {
      elShip.innerHTML = `
        <span class="original-fee">${formatKRW(SETTINGS.DEFAULT_SHIPPING_FEE)}</span>
        <strong class="free-badge">0원 (무료배송)</strong>
      `;
    } else {
      elShip.innerHTML = `<span>${formatKRW(shippingFee)}</span>`;
    }
  }
}

// 결제하기로 이동
function proceedToCheckout() {
  const selected = cart.filter(i => i.selected);
  if (selected.length === 0) {
    showToast("주문하실 상품을 선택해 주세요.", "info");
    return;
  }
  navigateTo("checkout");
}

// ==========================================================================
// 9. 주문 및 결제 섹션 (PRD 2.3 - ④ 결제 요약 및 주문 완료)
// ==========================================================================

function renderCheckoutPreview() {
  const previewContainer = document.getElementById("checkout-items-preview");
  const countBadge = document.getElementById("checkout-item-count");
  const coList = document.getElementById("co-list-total");
  const coDisc = document.getElementById("co-discount-total");
  const coShip = document.getElementById("co-shipping-fee");
  const coFinal = document.getElementById("co-final-total");
  const btnPayText = document.getElementById("btn-pay-text");
  const bannerBox = document.getElementById("co-shipping-status-banner");

  const selectedItems = cart.filter(i => i.selected);
  if (countBadge) countBadge.textContent = selectedItems.length;

  if (selectedItems.length === 0) {
    if (previewContainer) {
      previewContainer.innerHTML = `<p style="color: #64748b; padding: 20px 0;">주문할 상품이 없습니다. 장바구니에서 상품을 담아주세요.</p>`;
    }
    return;
  }

  // 품목 스냅샷 미리보기
  if (previewContainer) {
    previewContainer.innerHTML = selectedItems.map(item => `
      <div class="co-item-row">
        <img src="${item.thumbnail_url}" alt="${item.name}" class="co-item-thumb">
        <div class="co-item-info">
          <div class="co-item-name">${item.name}</div>
          <div class="co-item-detail">수량: ${item.qty}개 | ${formatKRW(item.sale_price * item.qty)}</div>
        </div>
      </div>
    `).join("");
  }

  const subtotal = selectedItems.reduce((acc, i) => acc + (i.sale_price * i.qty), 0);
  const listTotal = selectedItems.reduce((acc, i) => acc + (i.list_price * i.qty), 0);
  const discountTotal = listTotal - subtotal;
  const isFreeShipping = subtotal >= SETTINGS.FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : SETTINGS.DEFAULT_SHIPPING_FEE;
  const finalTotal = subtotal + shippingFee;

  if (coList) coList.textContent = formatKRW(listTotal);
  if (coDisc) coDisc.textContent = `-${formatKRW(discountTotal)}`;
  if (coFinal) coFinal.textContent = formatKRW(finalTotal);
  if (btnPayText) btnPayText.textContent = `${formatKRW(finalTotal)} 결제하기`;

  // 🚚 [PRD 2.3 - ④] 결제 금액 요약: 배송비 3,000원 -> 0원 취소선 처리
  if (coShip) {
    if (isFreeShipping) {
      coShip.innerHTML = `
        <span class="original-fee">${formatKRW(SETTINGS.DEFAULT_SHIPPING_FEE)}</span>
        <strong class="free-badge">0원 (무료배송)</strong>
      `;
    } else {
      coShip.innerHTML = `<span>${formatKRW(shippingFee)}</span>`;
    }
  }

  // 배송비 배너
  if (bannerBox) {
    if (isFreeShipping) {
      bannerBox.innerHTML = `🎉 <strong>50,000원 이상 구매 혜택:</strong> 무료배송이 적용되었습니다.`;
      bannerBox.style.background = "#f0fdf4";
      bannerBox.style.borderColor = "#86efac";
      bannerBox.style.color = "#15803d";
    } else {
      const diff = SETTINGS.FREE_SHIPPING_THRESHOLD - subtotal;
      bannerBox.innerHTML = `💡 <strong>${formatKRW(diff)}</strong> 더 구매하시면 무료배송이 적용됩니다!`;
      bannerBox.style.background = "#f0f9ff";
      bannerBox.style.borderColor = "#bae6fd";
      bannerBox.style.color = "#0369a1";
    }
  }
}

// 주문서 제출 처리 (가상 결제 완료 모달 띄우기)
function handleOrderSubmit(e) {
  e.preventDefault();

  const selectedItems = cart.filter(i => i.selected);
  if (selectedItems.length === 0) {
    showToast("주문하실 상품이 없습니다.", "info");
    return;
  }

  const name = document.getElementById("orderer-name").value.trim();
  const phone = document.getElementById("orderer-phone").value.trim();
  const address = document.getElementById("order-address").value.trim();
  const memo = document.getElementById("order-memo").value;

  const orderNo = "ORD-" + new Date().toISOString().slice(0, 10).replace(/-/g, '') + "-" + Math.floor(1000 + Math.random() * 9000);
  const subtotal = selectedItems.reduce((acc, i) => acc + (i.sale_price * i.qty), 0);
  const isFreeShipping = subtotal >= SETTINGS.FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : SETTINGS.DEFAULT_SHIPPING_FEE;
  const finalTotal = subtotal + shippingFee;

  // 주문 완료 모달 정보 세팅
  const modalOrderNo = document.getElementById("modal-order-no");
  const modalSummary = document.getElementById("modal-order-summary");

  if (modalOrderNo) modalOrderNo.textContent = orderNo;
  if (modalSummary) {
    modalSummary.innerHTML = `
      <p><strong>주문자:</strong> ${name} (${phone})</p>
      <p><strong>배송지:</strong> ${address}</p>
      <p><strong>배송요청:</strong> ${memo}</p>
      <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p><strong>주문상품:</strong> ${selectedItems[0].name} ${selectedItems.length > 1 ? `외 ${selectedItems.length - 1}건` : ''}</p>
      <p><strong>결제금액:</strong> <strong style="color:#ef4444; font-size:1.1rem;">${formatKRW(finalTotal)}</strong> (${isFreeShipping ? '무료배송 혜택 적용' : '배송비 3,000원 포함'})</p>
    `;
  }

  // 결제 완료 후 장바구니에서 선택된 아이템 제거
  cart = cart.filter(i => !i.selected);
  saveCartToStorage();
  updateCartBadge();

  // 모달 표시
  openModal("order-success-modal");
}

function closeOrderSuccessModalAndHome() {
  closeModal("order-success-modal");
  navigateTo("home");
}

// ==========================================================================
// 10. 모달 관리 (재입고 알림 & 팝업)
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
}

// [PRD 2.2] 재입고 알림 신청 모달 열기
function openRestockModal(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const nameEl = document.getElementById("restock-product-name");
  const idInput = document.getElementById("restock-product-id");

  if (nameEl) nameEl.textContent = product.name;
  if (idInput) idInput.value = product.id;

  openModal("restock-modal");
}

// 재입고 알림 폼 제출
function handleRestockSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById("restock-phone").value;
  closeModal("restock-modal");
  showToast(`[${phone}] 번호로 재입고 알림이 예약되었습니다!`, "success");
}

// ==========================================================================
// 11. 초기화 (App Initialization)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  updateCartBadge();
  initNavigation();
  initTimeSaleTimer();
  renderHomeSections();
  renderAllProducts();
  initCategoryTabs();

  // 배경 클릭 시 모달 닫기
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove("open");
        backdrop.setAttribute("aria-hidden", "true");
      }
    });
  });
});

