import * as HomePage from '../viewpage/home_page.js'
import * as PurchasesPage from '../viewpage/purchases_page.js'
import * as ProfilePage from '../viewpage/profile_page.js'
import * as ShoppingCartPage from '../viewpage/shoppingcart_page.js'
import * as ActivityPage from '../viewpage/activity_page.js'
import * as ProductPage from '../viewpage/product_page.js'
import * as UserPage from '../viewpage/user_page.js'
import * as AdminHome from '../viewpage/admin_home_page.js'

export const routePathname = {
    HOME: '/',
    PURCHASES: '/purchases',
    PROFILE: '/profile',
    SHOPPINGCART: '/shoppingcart',
    ACTIVITY: '/user-activity',
    PRODUCTS: '/manage-products',
    USERS: '/view-users',
    ADMIN: '/admin/',
    SEARCH: '/search/'
}

export const routes = [
    { pathname: routePathname.HOME, page: HomePage.home_page },
    { pathname: routePathname.PURCHASES, page: PurchasesPage.purchases_page },
    { pathname: routePathname.PROFILE, page: ProfilePage.profile_page },
    { pathname: routePathname.SHOPPINGCART, page: ShoppingCartPage.shoppingcart_page },
    { pathname: routePathname.ACTIVITY, page: ActivityPage.activity_page },
    { pathname: routePathname.PRODUCTS, page: ProductPage.product_page },
    { pathname: routePathname.USERS, page: UserPage.user_page },
    { patname: routePathname.ADMIN, page: AdminHome.admin_home_page },
    { pathname: routePathname.SEARCH, page: HomePage.home_page}
]

export function routing(path) {
    const route = routes.find(r => r.pathname == path)
    if (route) route.page()
    else routes[0].page()
}