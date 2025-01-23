document.addEventListener('DOMContentLoaded', function() {
    loadItems();
});

function increaseQuantity(id) {
    let quantity = document.getElementById(id);
    let price = parseFloat(quantity.dataset.price);
    quantity.textContent = parseInt(quantity.textContent) + 1;
    updateTotalPrice(id, price);
    saveItems();
}

function decreaseQuantity(id) {
    let quantity = document.getElementById(id);
    let price = parseFloat(quantity.dataset.price);
    if (parseInt(quantity.textContent) > 0) {
        quantity.textContent = parseInt(quantity.textContent) - 1;
        updateTotalPrice(id, price);
        saveItems();
    }
}

function updateTotalPrice(id, price) {
    let quantity = document.getElementById(id);
    let totalPriceElement = document.getElementById(`total-${id}`);
    let totalPrice = parseInt(quantity.textContent) * price;
    totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}

document.getElementById('add-item-button').addEventListener('click', function() {
    document.getElementById('item-modal').style.display = 'block';
});

document.querySelector('.close-button').addEventListener('click', function() {
    document.getElementById('item-modal').style.display = 'none';
});

document.getElementById('item-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const itemName = document.getElementById('item-name').value;
    const itemPrice = parseFloat(document.getElementById('item-price').value).toFixed(2);
    const itemQuantity = parseInt(document.getElementById('item-quantity').value);
    const itemImage = document.getElementById('item-image').files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;

        const container = document.getElementById('stock-container');
        const itemCount = container.getElementsByClassName('stock-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'stock-item';
        newItem.draggable = true;
        newItem.innerHTML = `
            <button class="delete-button" onclick="deleteItem(this)"><i class="fa-solid fa-trash"></i></button>
            <img src="${imageUrl}" alt="${itemName}" class="item-image">
            <h2>${itemName}</h2>
            <p>Price: $${itemPrice}</p>
            <div class="quantity-control">
                <label for="quantity${itemCount}">Quantity:</label>
                <button onclick="decreaseQuantity('quantity${itemCount}')">-</button>
                <span id="quantity${itemCount}" data-price="${itemPrice}">${itemQuantity}</span>
                <button onclick="increaseQuantity('quantity${itemCount}')">+</button>
            </div>
            <p id="total-quantity${itemCount}">Total Price: $${(itemPrice * itemQuantity).toFixed(2)}</p>
        `;
        container.appendChild(newItem);
        document.getElementById('item-modal').style.display = 'none';
        document.getElementById('item-form').reset();
        saveItems();
        addDragAndDropHandlers(newItem);
    };
    reader.readAsDataURL(itemImage);
});

function deleteItem(button) {
    if (confirm('Are you sure you want to delete this item?')) {
        const item = button.parentElement;
        item.remove();
        saveItems();
    }
}

function saveItems() {
    const container = document.getElementById('stock-container');
    const items = container.getElementsByClassName('stock-item');
    const itemsArray = [];
    for (let item of items) {
        const itemName = item.querySelector('h2').textContent;
        const itemPrice = parseFloat(item.querySelector('p').textContent.replace('Price: $', ''));
        const itemQuantity = parseInt(item.querySelector('span').textContent);
        const itemImage = item.querySelector('.item-image').src;
        itemsArray.push({ name: itemName, price: itemPrice, quantity: itemQuantity, image: itemImage });
    }
    localStorage.setItem('stockItems', JSON.stringify(itemsArray));
}

function loadItems() {
    const itemsArray = JSON.parse(localStorage.getItem('stockItems')) || [];
    const container = document.getElementById('stock-container');
    itemsArray.forEach((item, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'stock-item';
        newItem.draggable = true;
        newItem.innerHTML = `
            <button class="delete-button" onclick="deleteItem(this)"><i class="fa-solid fa-trash"></i></button>
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <h2>${item.name}</h2>
            <p>Price: $${item.price.toFixed(2)}</p>
            <div class="quantity-control">
                <label for="quantity${index + 1}">Quantity:</label>
                <button onclick="decreaseQuantity('quantity${index + 1}')">-</button>
                <span id="quantity${index + 1}" data-price="${item.price}">${item.quantity}</span>
                <button onclick="increaseQuantity('quantity${index + 1}')">+</button>
            </div>
            <p id="total-quantity${index + 1}">Total Price: $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        container.appendChild(newItem);
        addDragAndDropHandlers(newItem);
    });
}

function addDragAndDropHandlers(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement !== this) {
        draggingElement.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
        addDragAndDropHandlers(draggingElement);
        addDragAndDropHandlers(this);
        saveItems();
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    this.classList.remove('dragging');
}