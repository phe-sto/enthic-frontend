/*******************************************************************************
 * CLASS domId EXPORTED TO MAKE IT AVAILABLE AS MODULE
 */
export default class domId extends String {
    /***************************************************************************
     * Summary. Generate an DOM id based on a String
     *
     * Description. Uses hash function to create a valid most likely unique id
     * from any String. Epoch time is ms * random [0,1[ string is concatenate to
     * the former string. Inherite from String because id attribute is one.
     *
     * @param {String}  s   String to hash.
     *
     * @return {Object}     Object containing the DOM id as value.
     */
    constructor(s) {
        let hash = 0;
        var d = new Date();
        var n = d.getTime();
        //ADD TIME AND RANDOM FOR BETTER CHANCES TO HAVE A UNIQUE ID
        s = s + String(n * Math.random())
        for (let i = 0; i < s.length; i++) {
            let character = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // CONVERT TO 32BIT INTEGER
        }
        super(hash);
        return { "id": String(this) }
    }
}