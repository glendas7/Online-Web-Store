import * as Element from './element.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Auth from '../controller/auth.js'
import { ShoppingCart } from '../model/shoppingcart.js'
import * as Constant from '../model/constant.js'
import * as UserPage from '../viewpage/user_page.js'


let order
let products
let keywords
let userList
let infoList
let role
export let cart

export function addEventListeners() {
    Element.menuButtonHome.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.HOME)
        const label = Util.disableButton(Element.menuButtonHome)
        keywords = null
        order = null
        await home_page()
        Util.enableButton(Element.menuButtonHome, label)
    })
    Element.formSearch.addEventListener('submit', async e => {
        e.preventDefault()
        console.log('search')
        keywords = e.target.searchKeywords.value.trim()
        console.log(keywords)
        var elements = document.getElementsByClassName('user-auth')
        if (elements[0].style.display == 'none') role = 'admin'
        else if (elements[0].style.display == 'block') role = 'user'

        if (keywords.length == 0) {
            Element.mainContent.innerHTML = '<h1> No Results Found</h1>'
            keywords = null
            return
        }
        else {
            const label = Util.disableButton(Element.searchButton)
            var keywordsArray = keywords.match(/\S+/g)
            const words = keywordsArray.join('+')
            order = null
            history.pushState(null, null, Routes.routePathname.SEARCH + '#' + words)
            Util.enableButton(Element.searchButton, label)
            await home_page()
        }
    })
}

export async function home_page() {

    let html
    html = `<h1>Enjoy Your Shopping</h2>
                <div class="btn-group">
                    <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Sort By
                    </button>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" id="price-desc">Price(High-Low)</a>
                        <a class="dropdown-item" id="price-asc">Price(Low-High)</a>
                    </div>
                </div><br>
                `
    //show products on loading page
    Element.mainContent.innerHTML = html

    //show products  
    if (order != 1 && order != 2 && keywords == null) {
        try {
            products = await FirebaseController.getProductList()
            if (cart && cart.items) {

                cart.items.forEach(item => {
                    const product = products.find(p => {
                        return item.docId == p.docId
                    })
                    try { product.qty = item.qty }
                    catch {
                        product.qty = 0
                    }
                })
            }
            let index = 0
            products.forEach(product => {
                html += buildProductCard(product, index, role)
                ++index
            })
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('getProductList error', JSON.stringify(e))
            return
        }
    }

    //descending 
    if (order == 1 && keywords == null) {
        try {
            products = await FirebaseController.getProductListPriceDesc()
            if (cart && cart.items) {
                cart.items.forEach(item => {
                    const product = products.find(p => {
                        return item.docId == p.docId
                    })
                    try { product.qty = item.qty }
                    catch {
                        product.qty = 0
                    }
                })
            }

            let index = 0
            products.forEach(product => {
                html += buildProductCard(product, index, role)
                ++index
            })
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('getProductList error', JSON.stringify(e))
            return
        }
    }

    //ascending
    if (order == 2 && keywords == null) {
        try {
            products = await FirebaseController.getProductListPriceAsc()

            if (cart && cart.items) {
                cart.items.forEach(item => {
                    const product = products.find(p => {
                        return item.docId == p.docId
                    })
                    try { product.qty = item.qty }
                    catch {
                        product.qty = 0
                    }
                })
            }
            console.log(products[0].name)
            let index = 0
            products.forEach(product => {
                html += buildProductCard(product, index, role)
                ++index
            })
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('getProductList error', JSON.stringify(e))
            return
        }
    }

    if (keywords != null) {
        html = `<h1>Enjoy Your Shopping</h2>`

        try {
            products = await FirebaseController.searchProducts(keywords)
            let index = 0
            products.forEach(product => {
                html += buildProductCard(product, index)
                ++index
            })
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('getProductList error', JSON.stringify(e))
            return
        }
        if (Constant.adminEmails.includes(Auth.currentUser.email)) {
            try {
                userList = await FirebaseController.getUserList()
                infoList = await FirebaseController.getAccountInfoList()
                let searchedInfo
                let searchedUser
                userList.forEach(user => {
                    if (user.email == keywords) {
                        searchedUser = user
                        for (let i = 0; i < infoList.length; i++) {
                            if (user.uid == infoList[i].docId) {
                                searchedInfo = infoList[i]
                            }
                        }
                        html += UserPage.buildUserCard(searchedUser, searchedInfo)
                    }
                })
            } catch (e) {
                if (Constant.DEV) console.log(e)
                Util.popupInfo('Invalid - Non Admin', 'Only Admins may utilize this feature')
            }
        }
    }
    Element.mainContent.innerHTML = html

    //add to cart
    const plusForms = document.getElementsByClassName('form-increase-qty')
    for (let i = 0; i < plusForms.length; i++) {
        plusForms[i].addEventListener('submit', e => {
            e.preventDefault()
            const p = products[e.target.index.value]
            cart.addItem(p)
            document.getElementById(`qty-${p.docId}`).innerHTML = p.qty
            Element.shoppingCartCount.innerHTML = cart.getTotalQty()
        })
    }
    //remove from cart
    const minusForms = document.getElementsByClassName('form-decrease-qty')
    for (let i = 0; i < minusForms.length; i++) {
        minusForms[i].addEventListener('submit', e => {
            e.preventDefault()
            const p = products[e.target.index.value]
            cart.removeItem(p)
            document.getElementById(`qty-${p.docId}`).innerHTML = (p.qty == null || p.qty == 0) ? 'Add' : p.qty
            Element.shoppingCartCount.innerHTML = cart.getTotalQty()
        })
    }


    if (keywords == null) {
        //view price descending
        var descsort = document.getElementById('price-desc')
        descsort.addEventListener('click', async () => {
            order = 1
            keywords = null
            history.pushState(null, null, Routes.routePathname.HOME)
            console.log(order)
            home_page()

        })

        //view price ascending
        var ascsort = document.getElementById('price-asc')
        ascsort.addEventListener('click', async () => {
            order = 2
            keywords = null
            history.pushState(null, null, Routes.routePathname.HOME)
            console.log(order)
            home_page()
        })
    }
    //select view product button
    var viewForms = document.getElementsByClassName('view-comments-button')
    for (let i = 0; i < viewForms.length; i++) {
        viewForms[i].addEventListener('click', async () => {

            let product
            let comments

            try {
                product = await FirebaseController.getOneProduct(viewForms[i].value)
                if (!product) {
                    Util.popupInfo('Error', 'Product does not exist')
                    return
                }
            } catch (e) {
                Util.popupInfo('Error at product', JSON.stringify(e))
                return
            }

            try {
                comments = await FirebaseController.getCommentList(viewForms[i].value)
                if (!Comment) {
                    Util.popupInfo('Error', 'Comment does not exist')
                    return
                }
            } catch (e) {
                Util.popupInfo('Error at comment', JSON.stringify(e))
                return
            }
            let num = 0
            let total = 0
            let avg = '--'
            if (comments && comments.length > 0) {
                comments.forEach(c => {
                    if (c.rating != null) {
                        num++
                        total += c.rating
                    }
                })
                avg = total / num
            }

            let html = `
            <img src="${product.imageURL} class=" card-img-top" style="max-height: 300px; max-width: 300px;"><br><BR>
            <h2>${product.name} |
                ${Util.currency(product.price)}<br>
            </h2>

           <b>Average Rating : ${avg} Stars</b><BR><BR>
                ${product.summary}
                <br><br><br>
              
                    <h2> Comments:</h2>
                    `;
            if (comments && comments.length > 0) {
                comments.forEach(c => {
                    html += buildCommentView(c)
                })
            }
            if (comments.length == 0) {

                html += `
                <hr class="solid">
                <h2>No Comments Yet!</h2>
            `
                Element.modalViewCommentsBody.innerHTML = html
            }
            html += '</div>'
            Element.modalViewCommentsBody.innerHTML = html

            var deleteForms = document.getElementsByClassName('delete-comment-button')
            for (let i = 0; i < deleteForms.length; i++) {
                deleteForms[i].addEventListener('click', async () => {
                    console.log(deleteForms[i].value)
                    try {
                        await FirebaseController.deleteComment(deleteForms[i].value)
                        Util.popupInfo('Success', `Comment was deleted!`, 'modal-view-comment')
                    } catch (e) {
                        Util.popupInfo('Error at Comment', JSON.stringify(e), 'modal-view-comment')
                        return
                    }
                })
            }
        })
    }
}

function buildProductCard(product, index, role) {
    return `
        <div class="card" style="max-width: 300px; display: inline-block;">
        <img src="${product.imageURL} class=" card-img-top" style="max-height: 300px; max-width: 300px;">
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">
                ${Util.currency(product.price)}<BR>
            </p>
            <div class="container pt-3 bg-light ${Auth.currentUser && role != 'admin' ? 'd-block' : 'd-none'}">
                <form method="post" class="d-inline form-decrease-qty">
                    <input type="hidden" name="index" value="${index}">
                        <button class="btn btn-outline-danger" type="submit">&minus;</button>    
                </form>
                    <div id="qty-${product.docId}" class="container rounded text-center text-white bg-primary d-inline-block w-50">
                        ${product.qty == null || product.qty == 0 ? 'Add' : product.qty}
                    </div >
                    <form method="post" class="d-inline form-increase-qty">
                        <input type="hidden" name="index" value="${index}">
                            <button class="btn btn-outline-danger" type="submit">&plus;</button>    
                    </form><BR>
            </div>
            <div class="vertical-center">
                <button class="view-comments-button" data-toggle="modal" value=${product.docId} data-target="#modal-view-comment">View Product</button>
            </div>
        </div >
    </div>
    `
}

export function getShoppingCartFromLocalStorage() {
    let cartStr = window.localStorage.getItem(`cart-${Auth.currentUser.uid}`)
    // cartStr = '{"key": 50}'
    cart = ShoppingCart.parse(cartStr)
    if (!cart || !cart.isValid() || Auth.currentUser.uid != cart.uid) {
        window.localStorage.removeItem(`cart-${Auth.currentUser.uid}`)
        cart = new ShoppingCart(Auth.currentUser.uid)
    }
    Element.shoppingCartCount.innerHTML = cart.getTotalQty()
    console.log(cart.getTotalQty())
}

function buildCommentView(comment) {
    let url
    let html
    if (comment.rating == 1) {
        url = 'images/1star.png'
    } else if (comment.rating == 2) {
        url = 'images/2star.png'
    } else if (comment.rating == 3) {
        url = 'images/3star.png'
    } else if (comment.rating == 4) {
        url = 'images/4star.png'
    } else if (comment.rating == 5) {
        url = 'images/5star.png'
    }
    else if (comment.rating == null) {
        url = ""
    }
    html = `
        <div class="border border-secondary">
            <div class="bg-dark text-white">
                Comment by ${comment.email} on ${new Date(comment.timestamp).toString()}
            </div>
            <BR>
                <img src="${url} "><br>
                    ${comment.content}
            `
    if (Auth.currentUser) {
        if (Constant.adminEmails.includes(Auth.currentUser.email)) {
            html += `  <div class="vertical-center">
                            <button class="delete-comment-button" data-toggle="modal" value="${comment.docId}">Delete</button>
                        </div>
                    </div>   
                <hr>
                `
            return html
        }
    }

    html += `
        </div>   
        <hr>
    `
    return html
}

