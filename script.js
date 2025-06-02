document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    initializeScrollAnimations();
    initializeNavigation();
});


function initializeNavigation() {
  
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

   
    window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .category-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}


function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}


function filterProducts(category) {
    const products = document.querySelectorAll('.product-item');
    const categoryLinks = document.querySelectorAll('.category-link');

    
    categoryLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    products.forEach((product, index) => {
        if (category === 'all' || product.dataset.category === category) {
            setTimeout(() => {
                product.style.display = 'block';
                product.style.animation = 'fadeInUp 0.5s ease-out forwards';
            }, index * 50);
        } else {
            product.style.display = 'none';
        }
    });


    document.getElementById('products').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const products = document.querySelectorAll('.product-item');

    if (searchTerm === '') {
        products.forEach(product => {
            product.style.display = 'block';
        });
        return;
    }

    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const description = product.querySelector('.product-description').textContent.toLowerCase();
        const category = product.querySelector('.product-category').textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });

  
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});


function showDetailedView(productId) {
    const product = productDatabase[productId];
    if (!product) return;

    currentDetailProduct = product;

   
    document.getElementById('detailModalTitle').textContent = product.name;


    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = product.mainImage;
    mainImage.alt = product.name;

   
    const gallery = document.getElementById('productGallery');
    gallery.innerHTML = '';
    product.gallery.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `${product.name} - Image ${index + 1}`;
        img.className = 'gallery-image';
        img.onclick = () => {
            mainImage.src = imageSrc;
        };
        gallery.appendChild(img);
    });

    const detailContent = document.getElementById('productDetailContent');
    detailContent.innerHTML = `
        <div class="product-category mb-3">${product.category}</div>
        <h4 class="fw-bold mb-3">${product.name}</h4>
        <div class="d-flex align-items-center mb-4">
            <span class="current-price me-3">₹${product.price.toLocaleString()}</span>
            <span class="original-price me-2">₹${product.originalPrice.toLocaleString()}</span>
            <span class="product-badge">${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</span>
        </div>
        <p class="text-muted mb-4">${product.description}</p>
    `;


    const specsTable = document.getElementById('specificationsTable');
    specsTable.innerHTML = `
        <thead>
            <tr>
                <th>Specification</th>
                <th>Details</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(product.specifications).map(([key, value]) =>
        `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`
    ).join('')}
        </tbody>
    `;

   
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = product.features.map(feature =>
        `<li>${feature}</li>`
    ).join('');

  
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modal.show();
}


function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    updateCartCount();

    
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Added!';
    button.style.background = 'var(--success-color)';

    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);

    showNotification(`${productName} added to cart!`, 'success');
}

function addToCartFromDetailModal() {
    if (currentDetailProduct) {
        cart.push({
            name: currentDetailProduct.name,
            price: currentDetailProduct.price
        });
        updateCartCount();
        showNotification(`${currentDetailProduct.name} added to cart!`, 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('productDetailModal'));
        modal.hide();
    }
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

function viewCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'info');
        return;
    }

    let cartItems = 'Your Cart:\n\n';
    let total = 0;
    cart.forEach((item, index) => {
        cartItems += `${index + 1}. ${item.name} - ₹${item.price.toLocaleString()}\n`;
        total += item.price;
    });
    cartItems += `\nTotal: ₹${total.toLocaleString()}`;

    alert(cartItems);
}


function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="me-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}


function sendEmail(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const subject = encodeURIComponent('Contact Form Submission - Harvel Electric');
    const body = encodeURIComponent(
        `Name: ${form.querySelector('input[placeholder="Your Name"]').value}\n` +
        `Email: ${form.querySelector('input[placeholder="Your Email"]').value}\n` +
        `Phone: ${form.querySelector('input[placeholder="Your Phone"]').value || 'Not provided'}\n` +
        `Subject: ${form.querySelector('input[placeholder="Subject"]').value}\n\n` +
        `Message:\n${form.querySelector('textarea').value}`
    );

    const mailtoLink = `mailto:info@harvelelectric.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    form.reset();
    showNotification('Email client opened with your message!', 'success');
}


function downloadPriceList() {
    const priceListContent = `HARVEL ELECTRIC SOLUTIONS PVT. LTD.
COMPREHENSIVE PRODUCT CATALOG & PRICE LIST 2024`}