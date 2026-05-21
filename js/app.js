function render(products, containerId, limit = 8) {

  const container = document.getElementById(containerId);

  if (!container) return;

  const sliced = products.slice(0, limit);

  container.innerHTML = sliced.map(p => `

    <div class="card">

      <img 
        src="${p.image}" 
        class="card-img"
      >

      <h3>${p.name}</h3>

      <div class="price">
        $${p.price}
      </div>

      <a href="product.html?id=${p.id}">
        <button class="details-btn">
          View Details
        </button>
      </a>

    </div>

  `).join("");

  /* 🔥 CLICK ANIMATION */
  document.querySelectorAll(".details-btn").forEach(btn => {

    btn.addEventListener("click", () => {

      btn.style.transform = "scale(0.92)";

      setTimeout(() => {
        btn.style.transform = "scale(1)";
      }, 120);

    });

  });

}

render(window.products, "featured", 8);

render([...window.products].reverse(), "popular", 8);

/* CART */
function addToCart(id) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id,
      qty: 1
    });
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();
}

function updateCartCount() {

  const cart = JSON.parse(
    localStorage.getItem("cart")
  ) || [];

  const count = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const el = document.getElementById(
    "cart-count"
  );

  if (el) {
    el.innerText = count;
  }
}

updateCartCount();