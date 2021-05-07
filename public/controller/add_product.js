import * as FirebaseController from '../controller/firebase_controller.js'
import { Product } from '../model/product.js'
import * as Element from '../viewpage/element.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as ProductPage from '../viewpage/product_page.js'

let imageFiletoUpload

export function resetImageSelection() {
    imageFiletoUpload = null
    Element.imgTagAddProduct.src = ''
}

export function addEventListeners() {
    Element.formAddProduct.addEventListener('submit', async e => {
        e.preventDefault();
        const button = Element.formAddProduct.getElementsByTagName('button')[0]
        const label = Util.disableButton(button)
        await addNewProduct(e)
        await ProductPage.product_page();
        Util.enableButton(button, label)
    })

    Element.formAddImgButton.addEventListener('change', e => {
        imageFiletoUpload = e.target.files[0]
        if (!imageFiletoUpload) return
        const reader = new FileReader()
        reader.onload = () => Element.imgTagAddProduct.src = reader.result
        reader.readAsDataURL(imageFiletoUpload)
        Element.formAddProductError.image.innerHTML = ''
    })
}

async function addNewProduct(e) {
    const name = e.target.name.value
    const price = e.target.price.value
    const summary = e.target.summary.value

    const errorTags = document.getElementsByClassName("error-add-product")
    for (let i = 0; i < errorTags.length; i++) {
        errorTags[i].innerHTML = ''
    }

    const product = new Product({ name, price, summary });
    //check validation
    const errors = product.validate(imageFiletoUpload)
    if (errors) {
        if (errors.name)
            Element.formAddProductError.name.innerHTML = errors.name
        if (errors.price)
            Element.formAddProductError.price.innerHTML = errors.price
        if (errors.summary)
            Element.formAddProductError.summary.innerHTML = errors.summary
        if (errors.image)
            Element.formAddProductError.image.innerHTML = errors.image
        return

    }

    try {
        const { imageName, imageURL } = await FirebaseController.uploadImage(imageFiletoUpload)
        product.imageName = imageName
        product.imageURL = imageURL
        await FirebaseController.addProduct(product)

        Util.popupInfo("Success", `${product.name} added!`, 'modal-add-product')
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Adding Product Failed!', JSON.stringify(e), 'modal-add-product')
    }
}