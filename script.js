const card = document.querySelector(".card");
let startX = 0;
let endX = 0;
let isFlipped = false; // keep track of state

// Flip on click (fallback)
card.addEventListener("click", () => {
  isFlipped = !isFlipped;
  updateFlip();
});

// --- Swipe Detection on the whole page --- //
// Touch (mobile)
document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
});

// Mouse (desktop)
document.addEventListener("mousedown", (e) => {
  startX = e.clientX;
});

document.addEventListener("mouseup", (e) => {
  endX = e.clientX;
  handleSwipe();
});

function handleSwipe() {
  let diffX = endX - startX;

  if (Math.abs(diffX) > 50) { // threshold
    if (diffX > 0) {
      // Swiped Right → Flip to front
      isFlipped = false;
    } else {
      // Swiped Left → Flip to back
      isFlipped = true;
    }
    updateFlip();
  }
}

function updateFlip() {
  if (isFlipped) {
    card.classList.add("is-flipped");
  } else {
    card.classList.remove("is-flipped");
  }
}

// --- Wallet pop entrance animation --- //
window.addEventListener("load", () => {
  gsap.from(".card-container", {
    y: 80,
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: "back.out(1.7)"
  });
});
