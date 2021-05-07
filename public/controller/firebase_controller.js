import { Product } from '../model/product.js'
import * as Constant from '../model/constant.js'
import { ShoppingCart } from '../model/shoppingcart.js'
import { AccountInfo } from '../model/account_info.js'
import { Comment } from '../model/comments.js'
import * as Auth from '../controller/auth.js'


export async function getOneProduct(docId) {
    const ref = await firebase.firestore().collection(Constant.collectionName.PRODUCTS)
        .doc(docId).get()
    if (!ref.exists) {
        return null
    }

    const t = new Product(ref.data())

    t.docId = docId
    return t
}

export async function getCommentList(pid) {
    const snapShot = await firebase.firestore().collection(Constant.collectionName.COMMENTS)
        .where('pid', '==', pid)
        .orderBy('timestamp', 'desc')
        .get()

    const comments = []

    snapShot.forEach(doc => {
        var c = new Comment(doc.data())
        c.docId = doc.id
        comments.push(c)
    })
    return comments
}

export async function getAccountInfoList() {
    const snapShot = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
        .get()

    const accounts = []

    snapShot.forEach(doc => {
        var a = new AccountInfo(doc.data())
        a.docId = doc.id
        accounts.push(a)
    })
    return accounts
}

export async function editComment(docId, content, rating, time) {
    const myDoc = await firebase.firestore().collection(Constant.collectionName.COMMENTS)
        .doc(docId)

    await myDoc.update({ content: content, rating: rating, timestamp: time });
}

export async function deleteComment(docId) {
    await firebase.firestore().collection(Constant.collectionName.COMMENTS)
        .doc(docId).delete()
}

export async function deletePurchase(docId) {
    await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY)
        .doc(docId).delete()
}

export async function getActivityList() {
    var email = Auth.currentUser.email
    const snapShot = await firebase.firestore().collection(Constant.collectionName.COMMENTS)
        .where('email', '==', email)
        .get()

    const comments = []

    snapShot.forEach(doc => {
        var c = new Comment(doc.data())
        c.docId = doc.id
        comments.push(c)
    })
    return comments
}


export async function addComment(comment) {

    const data = comment.serialize()
    await firebase.firestore().collection(Constant.collectionName.COMMENTS).add(data)
}

export async function uploadProfilePhoto(photoFile, imageName) {
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.PROFILE_PHOTOS + imageName)
    const taskSnapShot = await ref.put(photoFile)
    const photoURL = await taskSnapShot.ref.getDownloadURL()
    return photoURL
}

export async function updateAccountInfo(uid, updateInfo) {
    await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
        .doc(uid).update(updateInfo)
}

export async function gettAccountInfo(uid) {
    const doc = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
        .doc(uid).get()

    if (doc.exists) {
        return new AccountInfo(doc.data())
    } else {
        const defaultInfo = AccountInfo.instance()
        await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
            .doc(uid).set(defaultInfo.serialize())
        return defaultInfo
    }
}

export async function createUser(email, password) {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
}

export async function signIn(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password)
}

export async function checkOut(cart) {
    const data = cart.serialize(Date.now())
    await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY).add(data)
}

export async function signOut() {
    await firebase.auth().signOut()
}

export async function getPurchaseHistory(uid) {
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.PURCHASE_HISTORY)
        .where('uid', '==', uid)
        .orderBy('timestamp', 'desc')
        .get()

    const carts = []
    snapShot.forEach(doc => {
        const sc = ShoppingCart.deserialize(doc.data())
        sc.docId = doc.id
        carts.push(sc)
    })
    return carts
}

export async function searchProducts(name) {
    let products = []
    const snapShot = await firebase.firestore().collection(Constant.collectionName.PRODUCTS)
        .where('name', '==', name)
        .get()
    snapShot.forEach(doc => {
        const p = new Product(doc.data())
        p.docId = doc.id
        products.push(p)
    })
    return products
}

export async function getProductList() {
    let products = []
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.PRODUCTS)
        .orderBy('name')
        .get()
    snapShot.forEach(doc => {
        const p = new Product(doc.data())
        p.docId = doc.id
        products.push(p)

    })
    return products
}

export async function getProductListPriceDesc() {
    let products = []
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.PRODUCTS)
        .orderBy('price', 'desc')
        .get()
    snapShot.forEach(doc => {
        const p = new Product(doc.data())
        p.docId = doc.id
        products.push(p)
    })
    return products
}
export async function getProductListPriceAsc() {
    let products = []
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.PRODUCTS)
        .orderBy('price', 'asc')
        .get()
    snapShot.forEach(doc => {
        const p = new Product(doc.data())
        p.docId = doc.id
        products.push(p)

    })
    return products
}

const cf_updateProduct = firebase.functions().httpsCallable('admin_updateProduct')
export async function updateProduct(product) {
    const docId = product.docId
    const data = product.serializeForUpdate()
    await cf_updateProduct({ docId, data })
}

//calls function admin_getProductById from index.js
const cf_getProductById = firebase.functions().httpsCallable('admin_getProductById')
export async function getProductById(docId) {
    const result = await cf_getProductById(docId)
    if (result.data) {
        const product = new Product(result.data)
        product.docId = result.data.docId
        return product
    }
    else {
        return null
    }
}

export async function uploadImage(imageFile, imageName) {
    if (!imageName) {
        imageName = Date.now() + imageFile.name
    }
    const ref = firebase
        .storage()
        .ref()
        .child(Constant.storageFolderName.PRODUCT_IMAGES + imageName)

    const taskSnapShot = await ref.put(imageFile)
    const imageURL = await taskSnapShot.ref.getDownloadURL()
    return { imageName, imageURL }
}

const cf_addProduct = firebase.functions().httpsCallable('admin_addProduct')
export async function addProduct(product) {
    await cf_addProduct(product.serialize());
}

const cf_deleteProduct = firebase.functions().httpsCallable('admin_deleteProduct')
export async function deleteProduct(docId, imageName) {
    await cf_deleteProduct(docId)
    const ref = firebase.storage().ref().child(Constant.storageFolderName.PRODUCT_IMAGES + imageName)
    await ref.delete()
}

const cf_getUserList = firebase.functions().httpsCallable('admin_getUserList')
export async function getUserList() {
    const result = await cf_getUserList()
    return result.data
}

const cf_updateUser = firebase.functions().httpsCallable('admin_updateUser')
export async function updateUser(uid, update) {
    await cf_updateUser({ uid, update })
}

const cf_deleteUser = firebase.functions().httpsCallable('admin_deleteUser')
export async function deleteUser(uid) {
    await cf_deleteUser(uid)
}