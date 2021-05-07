import * as Element from './element.js'
import * as Routes from '../controller/routes.js'
import * as Util from '../viewpage/util.js'
import * as Auth from '../controller/auth.js'
import * as Constant from '../model/constant.js'
import * as HomePage from '../viewpage/home_page.js'

export function addEventListeners() {
    Element.menuButtonAdminHome.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.ADMIN)
        const label = Util.disableButton(Element.menuButtonAdminHome)
        await admin_home_page()
        Util.enableButton(Element.menuButtonAdminHome, label)
    })
}

export async function admin_home_page() {
    if (!Constant.adminEmails.includes(Auth.currentUser.email)) {
        console.log('not admin')
        history.pushState(null, null, Routes.routePathname.HOME)
        HomePage.home_page()
    }

    let html
    html = `
    <h1>Welcome to the Admin's Page!</h1>
    <h3>
        <ul>
            <li>Add/Edit/Delete products </li>
            <li>Manage Users </li>
        </ul>
    </h3>
`
    Element.mainContent.innerHTML = html
}