// IMPORT SIMPLE DOM ID CREATOR BASED ON A HASH FUNCTION
import domId from "./dom-id.js";
export default class companyPanel extends String {
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