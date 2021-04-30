import * as Element from './element.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as Auth from '../controller/auth.js'

export function addEventListeners() {
    Element.menuUsers.addEventListener('click', async () => {
        const label = Util.disableButton(Element.menuUsers)
        history.pushState(null, null, Routes.routePathname.USERS)
        await user_page(null)
        Util.enableButton(Element.menuUsers, label)
    })
}

export async function user_page() {
    if (!Constant.adminEmails.includes(Auth.currentUser.email)) {
        console.log('not admin')
        history.pushState(null, null, Routes.routePathname.HOME)
        return
    }

    let html = `
    <h1>Manage Users</h1>
    `
    let userList
    let infoList
    try {
        userList = await FirebaseController.getUserList()
        infoList = await FirebaseController.getAccountInfoList()

        userList.forEach(user => {
            let info
            for (let i = 0; i < infoList.length; i++) {
                if (infoList[i].docId == user.uid) {
                    info = infoList[i]
                }
            }
            html += buildUserCard(user, info)
        })
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Error getUserList', JSON.stringify(e))
    }
    Element.mainContent.innerHTML = html

    const toggleForms = document.getElementsByClassName('form-toggle-user')
    for (let i = 0; i < toggleForms.length; i++) {
        toggleForms[i].addEventListener('submit', async e => {
            e.preventDefault()

            const button = e.target.getElementsByTagName('button')[0]
            const label = Util.disableButton(button)
            const uid = e.target.uid.value
            const update = {
                disabled: e.target.disabled.value === 'true' ? false : true
            }
            try {
                await FirebaseController.updateUser(uid, update)
                e.target.disabled.value = `${update.disabled}`
                document.getElementById(`status-${uid}`).innerHTML
                    = `${update.disabled ? 'Disabled' : 'Active'}`
                Util.popupInfo('Status toggled', `Disabled: ${update.disabled} `)
            } catch (e) {
                if (Constant.DEV) console.log(e)
                Util.popupInfo('Toggle Status Error', JSON.stringify(e))
            }
            Util.enableButton(button, label)
        })
    }
    //delete user button
    const deleteForms = document.getElementsByClassName('form-delete-user')
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener('submit', async e => {
            e.preventDefault()
            const r = confirm('Are you sure you want to delete user?')
            if (!r) return
            const button = e.target.getElementsByTagName('button')[0]
            Util.disableButton(button)

            const uid = e.target.uid.value
            try {
                await FirebaseController.deleteUser(uid)
                document.getElementById(`user-card-${uid}`).remove()
                Util.popupInfo('Deleted!', `User deleted: uid=${uid}`)
            } catch (e) {
                if (Constant.DEV) console.log(e)
                Util.popupInfo('Delete user error')

            }
        })
    }
}

export function buildUserCard(user, info) {

    return `
    <div id="user-card-${user.uid}"class="card" style="width: 18rem; display: inline-block">
    <img src="${user.photoURL != null ? user.photoUrl : 'images/user.png'}" class="card-img-top">
    <div class="card-body">
        <h5 class="card-title">${user.email}</h5>
        <p class="card-text">
            Display Name: ${user.displayName}<br>
            Real Name: ${info.name}<br>
            Phone Number: ${user.phoneNumber}<br>
            Address: ${info.address == '' ? 'null' : info.address}<br>
            City: ${info.city == '' ? 'null' : info.city}<br>
            State: ${info.state == '' ? 'null' : info.state}<br>
            Zip Code: ${info.zip == '' ? 'null' : info.zip}<br>
            Account Status: <span id="status-${user.uid}">${user.disabled ? 'disabled' : 'Active'} </span>
       </p>
        <form class="form-toggle-user" method="post">
            <input type="hidden" name="uid" value="${user.uid}">
            <input type="hidden" name="disabled" value="${user.disabled}">
            <button class="btn btn-outline-primary" type="submit">Toggle Active</button>
        </form>
        <form class="form-delete-user" method="post">
            <input type="hidden" name="uid" value="${user.uid}">
            <button class="btn btn-outline-danger" type="submit">Delete</button>
        </form>
  </div >
</div >


        `
}