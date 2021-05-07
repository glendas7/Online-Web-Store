import * as Routes from './controller/routes.js'

window.onload = () => {
    const path = window.location.pathname
    Routes.routing(path)
}

window.addEventListener('popstate', e => {
    e.preventDefault()
    const pathname = e.target.location.pathname
    const href = e.target.location.href
    Routes.routing(pathname, href)
})

import * as Auth from './controller/auth.js'
import * as HomePage from './viewpage/home_page.js'
import * as PurchasesPage from './viewpage/purchases_page.js'
import * as ProfilePage from './viewpage/profile_page.js'
import * as ShoppingCartPage from './viewpage/shoppingcart_page.js'
import * as ActivityPage from './viewpage/activity_page.js'
import * as ProductPage from '../viewpage/product_page.js'
import * as EditProduct from './controller/edit_product.js'
import * as AddProduct from './controller/add_product.js'
import * as User from './viewpage/user_page.js'
import * as AdminPage from './viewpage/admin_home_page.js'

Auth.addEventListeners()
HomePage.addEventListeners()
PurchasesPage.addEventListeners()
ProfilePage.addEventListeners()
ShoppingCartPage.addEventListeners()
ActivityPage.addEventListeners()
ProductPage.addEventListeners()
EditProduct.addEventListeners()
AddProduct.addEventListeners()
User.addEventListeners()
AdminPage.addEventListeners()