export default class domId extends String {
    constructor(s) {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            let character = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // Convert to 32bit integer
        }
        super(hash);
        return { "id": String(this) }
    }
}