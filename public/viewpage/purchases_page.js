import * as Element from './element.js'
import * as Auth from '../controller/auth.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'

export function addEventListeners() {
    Element.menuButtonPurchases.addEventListener('click', () => {
        history.pushState(null, null, Routes.routePathname.PURCHASES)
        purchases_page()
    })
}

export async function purchases_page() {
    if (!Auth.currentUser) {
        Element.mainContent.innerHTML = '<h1>Protected Page</h1>'
        return
    }
    let carts

    try {
        carts = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid)
        if (!carts || carts.length == 0) {
            Element.mainContent.innerHTML = 'No Purchase History Found'
            return
        }
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Purchase history error', JSON.stringify(e))
        return
    }
    let html = '<h1>Purchase History</h1>'
    html += `
    <table class="table table-striped">
        <thead>
        <tbody>
    `

    for (let index = 0; index < carts.length; index++) {
        html += `
        <tr><td>
        <form class="purchase-history" method ="post">
            <input type="hidden" name="index" value="${index}">
            <button class="btn" type="submit">
                ${new Date(carts[index].timestamp).toString()}
        </form>
        <button class="delete-purchase" value=${carts[index].docId}>Delete</button>
        </td></tr>
        `
    }

    html += '</tbody></table>'

    Element.mainContent.innerHTML = html


    //delete purchase
    var deletePurchaseButtons = document.getElementsByClassName('delete-purchase')
    for (let i = 0; i < deletePurchaseButtons.length; i++) {
        deletePurchaseButtons[i].addEventListener('click', async () => {
            const doc = deletePurchaseButtons[i].value

            try {
                await FirebaseController.deletePurchase(doc)
                history.pushState(null, null, Routes.routePathname.PURCHASES)
                purchases_page()
                Util.popupInfo('Success', 'Purchase Was Deleted!')
            } catch (e) {
                Util.popupInfo('Error Deleting Purchase', JSON.stringify(e))
                return
            }
        })
    }


    const historyForms = document.getElementsByClassName('purchase-history')
    for (let i = 0; i < historyForms.length; i++) {
        historyForms[i].addEventListener('submit', e => {
            e.preventDefault()
            const index = e.target.index.value
            Element.modalTransactionTitle.innerHTML = `Purchased At: ${new Date(carts[index].timestamp).toString()}`
            Element.modalTransactionBody.innerHTML = buildTransactionDetail(carts[index])
            $(`#modal-transaction`).modal('show')
        })
    }
    const deleteForms = document.getElementsByClassName('delete-purchase')
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener('click', e => {
            e.preventDefault()
            deleteForms[i].value
        })
    }
}



function buildTransactionDetail(cart) {
    let html = `
    <table class="table table-striped table-dark">
    <thead>
        <tr>
        <th scope="col">Image</th>
        <th scope="col">Name</th>
        <th scope="col">Price</th>
        <th scope="col">Qty</th>
        <th scope="col">Subtotal</th>
        <th scope="col" width="50%">Summary</th>
        <th scope="col" width="50%">Comment</th>
        </tr>

    </thead>
     <tbody>
     `
    cart.items.forEach(item => {
        html += `
        <tr>
            <td><img src="${item.imageURL}" width="150px"></td>
            <td>${item.name}</td>
            <td>${Util.currency(item.price)}</td>
            <td>${item.qty}</td>
            <td>${Util.currency(item.price + item.qty)}</td>
            <td>${item.summary}</td>
            <td>
            <br>

            <button
            id="menu-button-comment"
            class="btn btn-outline-danger modal-pre-auth"
            data-dismiss="modal"
            data-toggle="modal"
            data-target="#modal-comment"
            value = ${item.docId}
            onclick = "changePID(\'' + value + '\')"
          >
            Comment
          </button>
          </td>
        </tr>
        `
    })

    html += '</tbody></table>'
    html += `<div style="font-size: 150%;">Total: ${Util.currency(cart.getTotalPrice())}</div>`

    return html

}
