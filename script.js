// Cart functionality
// Load cart items from localStorage, or use an empty array if nothing is saved yet
// || [] – If nothing is found in localStorage (null), it initializes cartItems as an empty array.
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
// Track whether the cart UI is open or not
let cartOpen = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    updateCartCount();
    createCartOverlay();
    
    // Add event listeners to all add-to-cart buttons
    const addToCartButtons = document.querySelectorAll('.cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productContainer = this.closest('.pro');
            addToCart(productContainer);
        });
    });
    
    // Add event listener to navbar cart icon
    const navCartIcon = document.querySelector('#navbar .fa-cart-shopping');
    if (navCartIcon) {
        navCartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCart();
        });
    }
});

// Create the cart overlay
function createCartOverlay() {
    const cartHTML = `
        <div id="cart-overlay" class="cart-closed">
            <div class="cart-content">
                <div class="cart-header">
                    <h2>Your Shopping Cart</h2>
                    <button id="close-cart"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div id="cart-items" class="cart-items">
                    ${renderCartItems()}
                </div>
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span id="cart-subtotal">$${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span id="cart-shipping">$${calculateShipping().toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span id="cart-total">$${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
                <div class="cart-actions">
                    <button id="checkout-btn" class="checkout-btn">Proceed to Checkout</button>
                    <button id="continue-shopping" class="continue-btn">Continue Shopping</button>
                </div>
            </div>
            <div id="checkout-form-container" class="checkout-container hidden">
                <div class="checkout-header">
                    <button id="back-to-cart" class="back-btn"><i class="fa-solid fa-arrow-left"></i> Back to Cart</button>
                    <h2>Checkout</h2>
                </div>
                <form id="checkout-form" class="checkout-form">
                    <div class="form-section">
                        <h3>Shipping Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first-name">First Name</label>
                                <input type="text" id="first-name" required>
                            </div>
                            <div class="form-group">
                                <label for="last-name">Last Name</label>
                                <input type="text" id="last-name" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="address">Address</label>
                            <input type="text" id="address" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" required>
                            </div>
                            <div class="form-group">
                                <label for="postal-code">Postal Code</label>
                                <input type="text" id="postal-code" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="country">Country</label>
                            <select id="country" required>
                                <option value="">Select Country</option>
                                <option value="us">United States</option>
                                <option value="ca">Canada</option>
                                <option value="uk">United Kingdom</option>
                                <option value="au">Australia</option>
                                <option value="pk">Pakistan</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-section">
                        <h3>Payment Information</h3>
                        <div class="form-group">
                            <label for="card-name">Name on Card</label>
                            <input type="text" id="card-name" required>
                        </div>
                        <div class="form-group">
                            <label for="card-number">Card Number</label>
                            <input type="text" id="card-number" required placeholder="XXXX XXXX XXXX XXXX">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry">Expiry Date</label>
                                <input type="text" id="expiry" required placeholder="MM/YY">
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" required placeholder="XXX">
                            </div>
                        </div>
                    </div>
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="summary-row">
                            <span>Items (${getTotalItems()})</span>
                            <span>$${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>$${calculateShipping().toFixed(2)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                    <button type="submit" class="place-order-btn">Place Order</button>
                </form>
            </div>
        </div>
    `;
    
    // Add the cart overlay to the body
    const cartOverlayDiv = document.createElement('div');
    cartOverlayDiv.innerHTML = cartHTML;
    document.body.appendChild(cartOverlayDiv.firstElementChild);
    
    // Add event listeners
    document.getElementById('close-cart').addEventListener('click', toggleCart);
    document.getElementById('continue-shopping').addEventListener('click', toggleCart);
    document.getElementById('checkout-btn').addEventListener('click', showCheckout);
    document.getElementById('back-to-cart').addEventListener('click', hideCheckout);
    document.getElementById('checkout-form').addEventListener('submit', placeOrder);
}

// Toggle cart visibility
function toggleCart() {
    const cartOverlay = document.getElementById('cart-overlay');
    cartOpen = !cartOpen;
    
    if (cartOpen) {
        cartOverlay.classList.remove('cart-closed');
        cartOverlay.classList.add('cart-open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when cart is open
    } else {
        cartOverlay.classList.remove('cart-open');
        cartOverlay.classList.add('cart-closed');
        document.body.style.overflow = '';
        hideCheckout(); // Ensure checkout form is hidden when closing cart
    }
}

// Add a product to the cart
function addToCart(productElement) {
    const imgSrc = productElement.querySelector('img').src;
    const name = productElement.querySelector('h5').textContent;
    const price = productElement.querySelector('h4').textContent.replace('$', '');
    const id = Date.now().toString(); // Generate a unique ID
    
    const product = {
        id: id,
        name: name,
        price: parseFloat(price),
        imgSrc: imgSrc,
        quantity: 1
    };
    
    // Check if product already exists in cart
    const existingProductIndex = cartItems.findIndex(item => 
        item.name === product.name && item.price === product.price && item.id === product.id
    );
    
    if (existingProductIndex > -1) {
        // Increase quantity if product already in cart
        cartItems[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        cartItems.push(product);
    }
    
    // Save to localStorage and update cart
    saveCart();
    updateCart();
    
    // Show a notification
    showNotification(`${product.name} added to cart!`);
}

// Show notification when product is added
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Render cart items
function renderCartItems() {
    if (cartItems.length === 0) {
        return `<div class="empty-cart">
            <i class="fa-solid fa-cart-shopping empty-cart-icon"></i>
            <p>Your cart is empty</p>
            <button id="start-shopping" class="start-shopping-btn">Start Shopping</button>
        </div>`;
    }
    
    let cartItemsHTML = '';
    
    cartItems.forEach(item => {
        cartItemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.imgSrc}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    return cartItemsHTML;
}

// Update cart
function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = renderCartItems();
    
    // Add event listeners to new elements
    if (cartItems.length > 0) {
        // Quantity buttons
        const minusButtons = document.querySelectorAll('.quantity-btn.minus');
        const plusButtons = document.querySelectorAll('.quantity-btn.plus');
        const removeButtons = document.querySelectorAll('.remove-item');
        
        minusButtons.forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
        
        plusButtons.forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        
        removeButtons.forEach(button => {
            button.addEventListener('click', removeItem);
        });
    } else {
        // If cart is empty, add event listener to "Start Shopping" button
        const startShoppingBtn = document.getElementById('start-shopping');
        if (startShoppingBtn) {
            startShoppingBtn.addEventListener('click', toggleCart);
        }
    }
    
    // Update summary
    document.getElementById('cart-subtotal').textContent = `$${calculateSubtotal().toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `$${calculateShipping().toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${calculateTotal().toFixed(2)}`;
    
    // Update cart count
    updateCartCount();
}

// Increase item quantity
function increaseQuantity() {
    const id = this.getAttribute('data-id');
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCart();
    }
}

// Decrease item quantity
function decreaseQuantity() {
    const id = this.getAttribute('data-id');
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
        item.quantity -= 1;
        
        if (item.quantity <= 0) {
            // Remove item if quantity is 0 or less
            removeItemById(id);
        } else {
            saveCart();
            updateCart();
        }
    }
}

// Remove item
function removeItem() {
    const id = this.getAttribute('data-id');
    removeItemById(id);
}

// Remove item by ID
function removeItemById(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    saveCart();
    updateCart();
}

// Calculate subtotal
function calculateSubtotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate shipping
function calculateShipping() {
    // Free shipping for orders over $100, otherwise $10
    return calculateSubtotal() > 100 ? 0 : 10;
}

// Calculate total
function calculateTotal() {
    return calculateSubtotal() + calculateShipping();
}

// Get total number of items
function getTotalItems() {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// Update cart count in the navigation bar
function updateCartCount() {
    const cartCount = getTotalItems();
    
    // Check if cart count element exists, if not create it
    let cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) {
        cartCountElement = document.createElement('span');
        cartCountElement.className = 'cart-count';
        
        // Add it to the navbar cart icon
        const navCartIcon = document.querySelector('#navbar .fa-cart-shopping');
        if (navCartIcon) {
            navCartIcon.parentElement.appendChild(cartCountElement);
        }
    }
    
    // Update the count
    if (cartCount > 0) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = 'flex';
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Show checkout form
function showCheckout() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    document.querySelector('.cart-content').classList.add('hidden');
    document.getElementById('checkout-form-container').classList.remove('hidden');
}

// Hide checkout form
function hideCheckout() {
    document.querySelector('.cart-content').classList.remove('hidden');
    document.getElementById('checkout-form-container').classList.add('hidden');
}

// Place order
function placeOrder(e) {
    e.preventDefault();
    
    // Simulate order processing
    const orderBtn = document.querySelector('.place-order-btn');
    orderBtn.disabled = true;
    orderBtn.textContent = 'Processing...';
    
    setTimeout(() => {
        // Clear cart
        cartItems = [];
        saveCart();
        updateCart();
        
        // Show success message
        document.getElementById('checkout-form-container').innerHTML = `
            <div class="order-success">
                <i class="fa-solid fa-check-circle success-icon"></i>
                <h2>Thank You!</h2>
                <p>Your order has been placed successfully.</p>
                <p>Order confirmation has been sent to your email.</p>
                <button id="continue-shopping-after-order" class="continue-btn">Continue Shopping</button>
            </div>
        `;
        
        // Add event listener to new button
        document.getElementById('continue-shopping-after-order').addEventListener('click', () => {
            toggleCart();
        });
    }, 2000);
}