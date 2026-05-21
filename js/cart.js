let cart = JSON.parse(localStorage.getItem("cart")) || [];

const container = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");

function renderCart() {
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    subtotalEl.innerText = "";
    return;
  }

  container.innerHTML = cart.map((item, index) => {
    const product = window.products.find(p => p.id === item.id);
    if (!product) return "";

    const itemTotal = product.price * item.qty;
    total += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-info">
          <h3>${product.name}</h3>
          <p>$${product.price} × ${item.qty} = $${itemTotal}</p>
        </div>

        <div class="cart-controls">
          <button onclick="decreaseQty(${index})">-</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${index})">+</button>
          <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  subtotalEl.innerText = "Total: $" + total;
}

/* ➕ increase */
function increaseQty(index) {
  cart[index].qty++;
  saveCart();
}

/* ➖ decrease */
function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
}

/* ❌ remove */
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

renderCart();