export class Comment {
    constructor(data) {
        this.email = data.email
        this.content = data.content
        this.pid = data.pid
        this.rating = data.rating
        this.timestamp = data.timestamp
    }

    serialize() { //to firestore
        return {
            email: this.email,
            content: this.content,
            pid: this.pid,
            rating: this.rating,
            timestamp: this.timestamp,
        }
    }

    static deserialize(data) { //from firestore
        const c = new Comment(data.uid)
        c.email = data.email
        c.content = data.content
        c.pid = data.pid
        c.rating = data.rating
        c.timestamp = data.timestamp
        return c
    }


}