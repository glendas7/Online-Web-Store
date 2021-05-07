import * as Element from '../viewpage/element.js'
import * as FirebaseController from './firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as Routes from '../controller/routes.js'
import * as HomePage from '../viewpage/home_page.js'
import * as ProfilePage from '../viewpage/profile_page.js'
import { Comment } from '../model/comments.js'
import * as AdminPage from '../viewpage/admin_home_page.js'

export let currentUser
export let elements

export function addEventListeners() {

    Element.commentButton.addEventListener('click', async () => {
        var rating = 0
        var ele = document.getElementsByName('rating');

        for (let i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                rating = ele[i].value

            }
        }
        if (rating == 0) rating = null
        const email = currentUser.email
        const content = Element.commentBox.value
        const pid = Element.productIdValue.value
        const timestamp = Date.now()
        const mycomment = new Comment({ email, content, pid, rating, timestamp });

        try {
            await FirebaseController.addComment(mycomment)
            Util.popupInfo("Success", `Comment was added!`, 'modal-comment')
        } catch (e) {
            console.log(e)
        }
    })

    Element.editCommentButton.addEventListener('click', async () => {
        var rating = 0
        var ele = document.getElementsByName('rating');

        for (let i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                rating = ele[i].value
            }
        }
        if (rating == 0) rating = null
        const email = currentUser.email
        const content = Element.editCommentBox.value
        const timestamp = Date.now()
        const commentId = Element.commentIdValue.value

        try {
            await FirebaseController.editComment(commentId, content, rating, timestamp)
            $(`#modal-edit-comment`).modal('hide')
            Element.formEditComment.reset()
            Util.popupInfo("Success", `Comment was updated!`, 'modal-comment')

        } catch (e) {
            console.log(e)
            // Util.popupInfo('Adding Product Failed!', JSON.stringify(e), 'modal-add-product')
        }
        history.pushState(null, null, Routes.routePathname.ACTIVITY)
        const path = window.location.pathname
        Routes.routing(path)
    })

    Element.formSignin.addEventListener('submit', async e => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value
        try {
            await FirebaseController.signIn(email, password)
            $('#modal-form-signin').modal('hide')//hide modal
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Sign in Error', JSON.stringify(e), 'modal-form-signin')
        }
    })


    Element.menuButtonSignOut.addEventListener('click', async () => {
        try {
            await FirebaseController.signOut()
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Sign Out Error', JSON.stringify(e))
        }
    })

    firebase.auth().onAuthStateChanged(async user => {
        if (user) {
            // logged in
            currentUser = user
            HomePage.getShoppingCartFromLocalStorage()

            const accountInfo = await FirebaseController.gettAccountInfo(user.uid)
            ProfilePage.setProfileIcon(accountInfo.photoURL)

            //sign out button set visible
            elements = document.getElementsByClassName('post-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block'

            //sign in button set invisible
            elements = document.getElementsByClassName('pre-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'

            if (Constant.adminEmails.includes(user.email)) {
                elements = document.getElementsByClassName('admin-auth')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'block'

                elements = document.getElementsByClassName('user-auth')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'none'
                elements = document.getElementsByClassName('toggle-user')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'block'
                elements = document.getElementsByClassName('toggle-admin')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'none'
            } else {
                elements = document.getElementsByClassName('user-auth')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'block'

                elements = document.getElementsByClassName('admin-auth')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'none'
                elements = document.getElementsByClassName('toggle-user')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'none'
                elements = document.getElementsByClassName('toggle-admin')
                for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'none'
            }
            history.pushState(null, null, Routes.routePathname.HOME)
            AdminPage.admin_home_page()

        } else {
            currentUser = null

            elements = document.getElementsByClassName('pre-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block'
            elements = document.getElementsByClassName('post-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'

            elements = document.getElementsByClassName('admin-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'

            elements = document.getElementsByClassName('user-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'

            elements = document.getElementsByClassName('toggle-user')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            elements = document.getElementsByClassName('toggle-admin')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'

            history.pushState(null, null, Routes.routePathname.HOME)
            const path = window.location.pathname
            Routes.routing(path)
        }

    })

    Element.buttonSignUp.addEventListener('click', () => {
        //show sign up modal 
        $('#modal-form-signin').modal('hide')
        Element.formSignUp.reset()
        $('#modal-form-signup').modal('show')

    })

    Element.formSignUp.addEventListener('submit', e => {
        e.preventDefault()
        sign_up(e.target)
    })

    Element.menuButtonAdmin.addEventListener('click', e => {
        elements = document.getElementsByClassName('user-auth')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'none'
        elements = document.getElementsByClassName('toggle-user')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'block'
        elements = document.getElementsByClassName('toggle-admin')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'none'
        elements = document.getElementsByClassName('admin-auth')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'block'
    })
    Element.menuButtonUser.addEventListener('click', e => {
        elements = document.getElementsByClassName('user-auth')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'block'
        elements = document.getElementsByClassName('toggle-user')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'none'
        elements = document.getElementsByClassName('toggle-admin')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'block'
        elements = document.getElementsByClassName('admin-auth')
        for (let i = 0; i < elements.length; i++)
            elements[i].style.display = 'none'
    })
}

async function sign_up(form) {
    const email = form.email.value
    const password = form.password.value
    const passwordConfirm = form.passwordConfirm.value

    Element.formSignUpPasswordError.innerHTML = ''
    if (password != passwordConfirm) {
        Element.formSignUpPasswordError.innerHTML = 'Two passwords do not match'
        return
    }
    try {
        await FirebaseController.createUser(email, password)
        Util.popupInfo('Account Created', 'You are now signed in', 'modal-form-signup')
    }
    catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Failed to create a new account', JSON.stringify(e), 'modal-form-signup')

    }
}

