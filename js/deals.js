const dealsContainer = document.getElementById("deals-list");

/* DEAL PRODUCTS */
const deals = window.products.slice(0, 8);

dealsContainer.innerHTML = deals.map(product => {

  /* RANDOM SALE */
  const oldPrice = Math.floor(
    product.price * 1.25
  );

  const discount = Math.floor(
    ((oldPrice - product.price) / oldPrice) * 100
  );

  return `

    <div class="card deal-card">

      <!-- SALE BADGE -->
      <div class="sale-tag">
        -${discount}%
      </div>

      <img 
        src="${product.image}"
        class="card-img"
      >

      <h3>${product.name}</h3>

      <div class="deal-price">

        <span class="old-price">
          $${oldPrice}
        </span>

        <span class="new-price">
          $${product.price}
        </span>

      </div>

      <a href="product.html?id=${product.id}">

        <button class="details-btn">
          View Deal
        </button>

      </a>

    </div>

  `;

}).join("");