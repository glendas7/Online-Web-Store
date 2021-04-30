import { Product } from "./product.js"

export class ShoppingCart {
    constructor(uid) {
        this.uid = uid
        this.items //array of serialized objects
    }

    addItem(product) {
        if (!this.items) this.items = []

        const item = this.items.find(element => { return product.docId == element.docId })
        if (item) {
            ++product.qty
            ++item.qty
        } else {
            //new item
            product.qty = 1
            const newItem = product.serialize()
            newItem.docId = product.docId
            this.items.push(newItem)
        }
        this.saveToLocalStorage()
    }
    removeItem(product) {
        // decrement quantity or remove from items array if qty = 0
        const index = this.items.findIndex(element => { return product.docId == element.docId })
        if (index >= 0) {
            --this.items[index].qty
            --product.qty
            if (product.qty == 0) {
                this.items.splice(index, 1)
            }
        }
        this.saveToLocalStorage()
    }

    serialize(timestamp) {// to firestore
        return { uid: this.uid, items: this.items, timestamp }
    }

    static deserialize(data) {//from firestore
        const sc = new ShoppingCart(data.uid)
        sc.items = data.items
        sc.timestamp = data.timestamp
        return sc
    }

    saveToLocalStorage() {
        window.localStorage.setItem(`cart-${this.uid}`, this.stringify())
    }

    stringify() {
        return JSON.stringify({ uid: this.uid, items: this.items })
    }

    static parse(cartString) {
        try {
            const obj = JSON.parse(cartString)
            const sc = new ShoppingCart(obj.uid)
            sc.items = obj.items
            return sc
        }
        catch (e) {
            return null;
        }
    }

    isValid() {
        if (!this.uid || typeof this.uid != 'string') return false
        if (!this.items || !Array.isArray(this.items)) return false
        for (let i = 0; i < this.items.length; i++) {
            if (!Product.isSerializedProduct(this.items[i])) return false
        }
        return true
    }

    getTotalQty() {
        if (!this.items) return 0
        let n = 0
        this.items.forEach(item => { n += item.qty })
        return n
    }

    getTotalPrice() {
        if (!this.items) return 0
        let total = 0
        this.items.forEach(item => {
            total += item.price * item.qty
        })
        return total
    }

    empty() {
        this.items = null
    }
}