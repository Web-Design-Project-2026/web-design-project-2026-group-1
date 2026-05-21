const params = new URLSearchParams(window.location.search);

const id = Number(params.get("id"));

const product = window.products.find(p => p.id === id);

const container = document.getElementById("product-page");

if (product && container) {

  container.innerHTML = `

    <div class="product-layout">

      <!-- LEFT -->
      <div>

        <img 
          src="${product.image}" 
          class="product-image"
        >

        <div class="product-thumbs">

          <img src="${product.image}">
          <img src="${product.image}">
          <img src="${product.image}">
          <img src="${product.image}">

        </div>

      </div>

      <!-- RIGHT -->
      <div>

        <span class="badge">
          ${product.category.toUpperCase()}
        </span>

        <h1>${product.name}</h1>

        <p class="rating">
          ⭐ 4.8 (243 reviews)
        </p>

        <div class="price-box">
          $${product.price}
        </div>

        <!-- SPECS -->
        <div class="specs">

          <div>
            <strong>Performance</strong><br>
            Enthusiast Grade
          </div>

          <div>
            <strong>Warranty</strong><br>
            3 Years
          </div>

          <div>
            <strong>Availability</strong><br>
            In Stock
          </div>

          <div>
            <strong>Shipping</strong><br>
            Free Delivery
          </div>

        </div>

        <!-- QUANTITY -->
        <div class="qty-box">

          <button onclick="changeQty(-1)">
            -
          </button>

          <span id="qty">1</span>

          <button onclick="changeQty(1)">
            +
          </button>

        </div>

        <!-- ACTIONS -->
        <div class="actions">

          <button 
            class="btn-primary"
            onclick="addToCartWithQty(${product.id})"
          >
            Add to Cart
          </button>

          <button class="btn-secondary">
            Wishlist
          </button>

        </div>

        <!-- DESCRIPTION -->
        <div class="desc">

          <h3>Description</h3>

          <p>
            ${product.description}
          </p>

        </div>

      </div>

    </div>

  `;
}

/* QUANTITY */
let qty = 1;

function changeQty(val) {

  qty = Math.max(1, qty + val);

  document.getElementById("qty").innerText = qty;
}

/* ADD TO CART */
function addToCartWithQty(id) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id,
      qty
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
}