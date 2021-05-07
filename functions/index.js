const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./account_key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

const Constant = require("./constant");

exports.admin_addProduct = functions.https.onCall(addProduct)
exports.admin_getProductList = functions.https.onCall(getProductList)
exports.admin_getProductById = functions.https.onCall(getProductById)
exports.admin_updateProduct = functions.https.onCall(updateProduct)
exports.admin_deleteProduct = functions.https.onCall(deleteProduct)
exports.admin_getUserList = functions.https.onCall(getUserList)
exports.admin_updateUser = functions.https.onCall(updateUser)
exports.admin_deleteUser = functions.https.onCall(deleteUser)


function isAdmin(email) {
    return Constant.adminEmails.includes(email);
}

async function deleteUser(uid, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admit: ', context.auth.token.email)
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Invalid Privileges'
        )
    }
    try {
        await admin.auth().deleteUser(uid)
    } catch (e) {
        throw new functions.https.HttpsError(
            'internal',
            'deleteUser failed'
        )
    }

}

async function updateUser(data, context) {
    //data= {uid, update(info)}
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admit: ', context.auth.token.email)
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Invalid Privileges'
        )
    }
    try {
        const uid = data.uid
        const update = data.update
        await admin.auth().updateUser(uid, update)

    } catch (e) {
        throw new functions.https.HttpsError(
            'internal',
            'updateUser failed'
        )

    }
}

async function getUserList(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admit: ', context.auth.token.email)
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Invalid Privileges'
        )
    }
    const userList = []
    try {
        let userRecord = await admin.auth().listUsers(1000)
        userList.push(...userRecord.users)
        let nextPageToken = userRecord.pageToken
        /* eslint-disable no-await-in-loop */
        while (nextPageToken) {
            userRecord = await admin.auth().listUsers(1000, nextPageToken)
            userList.push(...userRecord.users)
            nextPageToken = userRecord.pageToken
        }
        /* eslint-enable no-await-in-loop */
        return userList
    } catch (e) {
        throw new functions.https.HttpsError(
            'internal',
            'getUserList failed'
        )

    }
}

async function deleteProduct(docId, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admit: ', context.auth.token.email)
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Invalid Privileges'
        )
    }
    try {
        await admin.firestore().collection(Constant.collectionName.PRODUCTS)
            .doc(docId).delete()
    } catch (e) {
        throw new functions.https.HttpsError(
            'internal',
            'deleteProduct failed'
        )

    }
}

async function updateProduct(productInfo, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admit: ', context.auth.token.email)
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Invalid Privileges'
        )
    }
    try {
        await admin.firestore().collection(Constant.collectionName.PRODUCTS)
            .doc(productInfo.docId).update(productInfo.data)
    } catch (e) {
        throw new functions.https.HttpsError(
            'internal',
            'updateProduct failed'
        )
    }
}

async function getProductById(docId, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log('not admit: ', context.auth.token.email)
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Invalid Privileges'
        )
    }
    try {
        const doc = await admin.firestore().collection(Constant.collectionName.PRODUCTS)
            .doc(docId).get()
        if (doc.exists) {
            const { name, summary, price, imageName, imageURL } = doc.data()
            const p = { name, price, summary, imageName, imageURL }
            p.docId = doc.id
            return p
        } else {
            return null
        }
    } catch (e) {
        throw new functions.https.HttpsError(
            'internal',
            'getProductById failed'
        )

    }
}

async function getProductList(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admit: ", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Invalid Privileges"
        )
    }

    try {
        let parray = []
        const snapShot = await admin.firestore().collection(Constant.collectionName.PRODUCTS)
            .orderBy("name").get()
        snapShot.forEach(doc => {
            const { name, price, summary, imageName, imageURL } = doc.data()
            const p = { name, price, summary, imageName, imageURL }
            p.docId = doc.id
            parray.push(p)
        })
        return parray
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError("internal", "getProductList failed");
    }
}

async function addProduct(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admit: ", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Invalid Privileges"
        )
    }

    try {
        await admin.firestore()
            .collection(Constant.collectionName.PRODUCTS)
            .add(data);
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError("internal", "addProduct failed");
    }
}