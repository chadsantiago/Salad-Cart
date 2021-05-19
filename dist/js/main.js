const menu = document.querySelector('.menu-template')
const cart = document.querySelector('.cart-template')
const container = document.querySelector('.menu')
const cartContainer = document.querySelector('.cart')

const local_storage_key_cart = 'menu.cart'
const local_storage_key_menu = 'menu.menu'
let menuitems = JSON.parse(localStorage.getItem(local_storage_key_menu)) || []
let menuCart = JSON.parse(localStorage.getItem(local_storage_key_cart)) || []

class Products {
    async getProductsApi() {
        try {
            const response = await fetch('dist/data/salads.json')
            const menu = await response.json()
            console.log('Success fetching from API')
            return menu
        } catch {
            console.log('Error fetching from API')
        }
    }

    async saveProductsStorage(products) {
        try {
            products.forEach(menu => {
                const newmenu = storage.createmenu(menu.item, menu.public_id, menu.price)
                menuitems.push(newmenu)
                storage.save()
                console.log('Success saving to local storage')
            });
        } catch {
            console.log('Error saving to local storage')
        }
    }
}

class Ui {

    static clearContainer(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }
    
    static displayProducts(products) {
        this.clearContainer(container)
        products.forEach(coffee => {
            const menuTemplate = document.importNode(menu.content, true)
            const itemName = menuTemplate.querySelector('.item-name')
            itemName.append(coffee.item)

            const cartBtn = menuTemplate.querySelector('.cart-button')
            cartBtn.dataset.listId = coffee.id
            cartBtn.dataset.listName = coffee.item
            cartBtn.dataset.listPrice = coffee.price
            cartBtn.id = coffee.incart

            const itemPrice = menuTemplate.querySelector('.item-price')
            itemPrice.append('₱' + coffee.price)

            container.appendChild(menuTemplate)
        })
    }

    static displayCart(coffee) {
        this.clearContainer(cartContainer)
        coffee.forEach(coffee => {
            const cartTemplate = document.importNode(cart.content, true)
            const itemName = cartTemplate.querySelector('.cart-name')
            itemName.append(coffee.item)

            const itemPrice = cartTemplate.querySelector('.cart-price')
            itemPrice.append('₱' + coffee.price)

            const itemTotal = cartTemplate.querySelector('.cart-item-total')
            itemTotal.append('₱' + coffee.total)

            const quantity = cartTemplate.querySelector('.quantity')
            quantity.append(coffee.quantity)

            const add = cartTemplate.querySelector('.add')
            add.dataset.listId = coffee.id

            const less = cartTemplate.querySelector('.less')
            less.dataset.listId = coffee.id

            cartContainer.appendChild(cartTemplate)
        })
    }
}

class storage {
    static createcart(name, public_id, price) {
        return { id: public_id.toString(), item: name, price: price, total: price, incart: 'incart', quantity: 1}
    }

    static createmenu(name, public_id, price) {
        return { id: public_id.toString(), item: name, price: price, incart: 'add'}
    }

    static cartTotal() {
        const subtotal = document.querySelector('.cart-subtotal')
        let totalprice = menuCart.reduce((total, cart) => total + parseInt(cart.total), 0)
        subtotal.innerText = 'My Cart - ₱' + totalprice
    }

    static updateCart() {
        menuCart = menuCart.filter(cart => !cart.quantity == 0)
        this.save()
    }

    static clearCart() {
        menuCart = menuCart.filter(cart => !cart.incart)
        const updateMenu = menuitems.filter(menu => menu.incart == 'incart')
        updateMenu.forEach(cartStatus => {
            cartStatus.incart = 'add'
        })
        this.save()
        render()
    }

    static save() {
        localStorage.setItem(local_storage_key_menu, JSON.stringify(menuitems))
        localStorage.setItem(local_storage_key_cart, JSON.stringify(menuCart))
    }
}

const render = () => {
    Ui.displayProducts(menuitems)
    Ui.displayCart(menuCart)
    storage.cartTotal()
}

container.addEventListener('click', e => {
    if(e.target.id.toLowerCase() === 'add') {
        e.preventDefault()
        const cartPrice = e.target.dataset.listPrice
        const cartItem = e.target.dataset.listName
        const cartId = e.target.dataset.listId
        const newcart = storage.createcart(cartItem, cartId, cartPrice)
        menuCart.push(newcart)

        const selectedItem = menuitems.find(menu => menu.id === e.target.dataset.listId)
        console.log(selectedItem)
        selectedItem.incart = 'incart'
        storage.save()
        render()
    }
})

cartContainer.addEventListener('click', e => {
    if(e.target.id == 'add') {
        e.preventDefault()
        const selectedcoffee = menuCart.find(menu => menu.id === e.target.dataset.listId)
        selectedcoffee.quantity += 1
        selectedcoffee.total  = parseInt(selectedcoffee.total) + parseInt(selectedcoffee.price)
    }
    if(e.target.id == 'less') {
        e.preventDefault()
        const selectedcoffee = menuCart.find(menu => menu.id === e.target.dataset.listId)
        const total = selectedcoffee.quantity -= 1
        selectedcoffee.total = parseInt(selectedcoffee.total) - parseInt(selectedcoffee.price)

        if (total == 0) {
            const updateCartStatus = menuitems.filter(menu => menu.id === e.target.dataset.listId && menu.incart === 'incart')
            updateCartStatus.forEach(status => {
                status.incart = 'add'
            })
            storage.updateCart()
        }
    }
    storage.save()
    render()
})

document.addEventListener('DOMContentLoaded', () => {
    const product = new Products()

    if (localStorage.getItem(local_storage_key_menu) != null) {
        setTimeout(() => {
            Ui.displayProducts(menuitems)
            console.log('Rendered menu from Local Storage...')
        }, 3000)
        Ui.displayCart(menuCart)
        storage.cartTotal()
    } else {
        console.log('Fetching from API...')
        product.getProductsApi()
            .then(response => {
                product.saveProductsStorage(response)
                setTimeout(() => {
                    Ui.displayProducts(menuitems)
                }, 3000)
            })
    }
})

const showNav = () => {
    const navMenu = document.querySelector('.nav-menu')
    const links = document.querySelectorAll('.link-menu')
    const icon = document.querySelectorAll('.social-icon')
    const body = document.querySelector('.body')

    navMenu.classList.toggle('hide')
    body.classList.toggle('hide-scroll')

    for (let i = 0; i < links.length; i++) {
        links[i].classList.toggle('animate__flipInX')
    }

    for (let j = 0; j < icon.length; j++) {
        icon[j].classList.toggle('animate__flipInX')
    }
}
