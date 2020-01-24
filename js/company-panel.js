/*******************************************************************************
 * DEPENDENCY WITH domId, THE COMPANY PANEL CONTAINS ID.
 */
import domId from "./dom-id.js";
/*******************************************************************************
 * CLASS companyPanel EXPORTED TO MAKE IT AVAILABLE AS MODULE
 */
export default class companyPanel extends String {
    /***************************************************************************
     * Summary. Generate a Boostrap pannel HTML DOM for a company.
     *
     * Description. The company panel contains details about the company. It
     * uses the bootstrap library to be collapsable and save space. Value are
     * financial amount and to be converted to French local for thousand
     * separation. Inherite from String because HTML is one.
     *
     * @param {String}          alertType Type of Bootstrap alert
     * @param {String}          key Key from company details
     * @param {String, Number}  value Value from company details
     *
     * @return {Object} Object containing the DOM HTML as value.
     */
    constructor(alertType, key, value) {
        let uniqueId = new domId(key)
        super(`<div class = "panel panel-default">
                        <div class = "panel-heading" data-toggle="collapse" href = "#${uniqueId.id}" style="cursor:pointer;">
                            <h4 class = "panel-title">
                                <a data-toggle="collapse" href="#${uniqueId.id}">${key}</a>
                            </h4>
                        </div>
                        <div id="${uniqueId.id}" class="panel-collapse collapse">
                            <div class="alert alert-${alertType}">${value.toLocaleString("fr-FR")}</div>
                        </div>
                    </div>`);
        return { "html": String(this) }
    }
}