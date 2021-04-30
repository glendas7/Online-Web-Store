import * as Element from './element.js'

export function popupInfo(title, body, closeModal) {//title, body, modal you need to close
    if (closeModal)
        $('#' + closeModal).modal('hide')
    Element.popupInfoTitle.innerHTML = title
    Element.popupInfoBody.innerHTML = body
    $('#modal-popup-info').modal('show')
}

export function disableButton(button) {
    button.disabled = true
    const label = button.innerHTML
    button.innerHTML = 'Wait...'
    return label
}

export function enableButton(button, label) {
    if (label) button.innerHTML = label
    button.disabled = false
}

export function currency(money) {
    return new Intl.NumberFormat('eng-US', { style: 'currency', currency: 'USD' }).format(money)
}
