const list = document.getElementById("list");

const params = new URLSearchParams(window.location.search);

const category = params.get("category");

let filtered = window.products;

if (category) {
  filtered = window.products.filter(
    p => p.category === category
  );
}

/* ACTIVE CATEGORY */
document.querySelectorAll(".filter-item").forEach(link => {

  if (category && link.href.includes(category)) {
    link.classList.add("active");
  }

});

/* RENDER */
list.innerHTML = filtered.map(p => `

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