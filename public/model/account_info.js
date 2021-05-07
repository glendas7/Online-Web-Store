export class AccountInfo {
    constructor(data) {
        this.name = data.name
        this.email = data.email
        this.address = data.address
        this.city = data.city
        this.state = data.state
        this.zip = data.zip
        this.creditCardNo = data.creditCardNo
        this.photoURL = data.photoURL
    }

    serialize() {
        return {
            name: this.name,
            email: this.email,
            address: this.address,
            city: this.city,
            state: this.state,
            zip: this.zip,
            creditCardNo: this.creditCardNo,
            photoURL: this.photoURL,
        }
    }
    static instance() {
        return new AccountInfo({
            name: '', email: '' ,address: '', city: '',
            state: '', zip: 0, creditCardNo: 0,
            photoURL: 'images/blank_profile.png'
        })
    }
}