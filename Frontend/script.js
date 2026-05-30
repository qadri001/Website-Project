document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('product-display');
    
    // 1. Show a loading message
    display.innerHTML = "<p style='padding: 20px;'>Loading products...</p>";

    // 2. Fetch from your Flask Backend
    fetch('/api/products')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                display.innerHTML = "<p>No products found.</p>";
                return;
            }

            display.innerHTML = data.map(product => `
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="/static/images/${product.image}" 
                             onerror="this.src='https://via.placeholder.com/250?text=Product+Image'" 
                             alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">${product.price}</p>
                        <button class="btn-gold" style="width: 100%; border: none; cursor: pointer; padding: 10px; border-radius: 5px;">Add to Cart</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            display.innerHTML = "<p style='color: red; padding: 20px;'>Error loading products. Make sure app.py is running.</p>";
        });
});