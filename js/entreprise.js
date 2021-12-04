'use strict';

/*******************************************************************************
 * Class inheriting DOM element, a collapsable panel displaying the data. It
 * needs two attributes to display a coherent panel, the description of a value
 * and its value. For instance:
 * <company-panel description="SIREN" value="123456789">
 */
class companyPanel extends HTMLElement {
    constructor() {
        super(); // AN HTML DOM
        // THE TWO ATTRIBUTES
        const DESCRIPTION_ATTRIBUTE = "description";
        const VALUE = "value";
        // GET THE ATTRIBUTES OR SET A DEFAULTS VALUE
        if (this.hasAttribute(DESCRIPTION_ATTRIBUTE)) {
            this.description = this.getAttribute(DESCRIPTION_ATTRIBUTE);
        } else {
            this.description = "Aucune description de cette donnée"
        }
        if (this.hasAttribute(VALUE)) {
            this.value = this.getAttribute(VALUE);
        } else {
            this.value = "0"
        }
        /***********************************************************************
         * For a collapsable panel hrefs must link to the id. To cr  create a
         * unique id, a hash function of the description is used.
         **/
        let id = this._hash
        this.innerHTML = `<div class = "panel panel-default">
              <div class = "panel-heading" data-toggle="collapse" href="#${id}" style="cursor:pointer;">
                  <h4 class = "panel-title">
                      <a data-toggle="collapse" href="#${id}">${this.description}</a>
                  </h4>
              </div>
              <div id="${id}" class="panel-collapse collapse">
                  <div class="alert alert-info">${this.value.toLocaleString("fr-FR")}</div>
              </div>
          </div>`;
    }

    /***************************************************************************
     * Summary. Create a hash base on the description
     *
     * Description. Uses hash function to create a valid most likely unique id
     * from any String. Epoch time is ms * random [0,1[ string is concatenate to
     * the former string. Inherit from String because id attribute is one.
     */
    get _hash() {
        let hash = 0;
        const d = new Date();
        const t = d.getTime();
        let s = this.description;
        //ADD TIME AND RANDOM FOR BETTER CHANCES TO HAVE A UNIQUE ID
        s = s + String(t * Math.random())
        for (let i = 0; i < s.length; i++) {
            let character = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // CONVERT TO 32BIT INTEGER
        }
        return String(Math.abs(hash))
    }
}

customElements.define('company-panel', companyPanel);
/*******************************************************************************
 * Event fired when changed the year or selecting average data
 */
document.getElementById("select-year").addEventListener("change", function () {
    const searchInput = document.getElementById("search-company");
    // CALL getCompanyDetailsUpdatePannelTitle WHEN YEAR OR AVERAGE CHANGES
    getCompanyDetailsUpdatePannelTitle(
        searchInput.dataset.siren,
        searchInput.dataset.denomination
    );
});
/*******************************************************************************
 * Initialization of the autocomplete for company input using pixabay vanilla
 * library, no dependency. source from
 * https://github.com/Pixabay/JavaScript-autoComplete
 */
const xhr = new XMLHttpRequest();
new autoComplete({
    selector: '#search-company',
    minChars: 1,
    source: function (term, response) {
        term = term.toUpperCase();
        // HTTP POST REQUEST TO api.enthic WITH THE INPUT VALUE
        xhr.open("POST", "https://api.enthic.fr/company/search/", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.responseType = "json";
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                response(xhr.response.member);
            }
        };
        let data = JSON.stringify({"probe": term, "limit": 100});
        xhr.send(data);
    },
    // HOW TO RENDER THE ITEM
    renderItem: function (item, search) {
        search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
        const display_result = item.siren.value + ", " + item.denomination.value
        // ADD siren AND denomination ATTRIBUTES
        return `<div class="autocomplete-suggestion" data-val="${display_result}" data-siren="${item.siren.value}" data-denomination="${item.denomination.value}">${display_result.replace(re, "<b>$1</b>")}</div>`;
    },
    /***************************************************************************
     * Triggered when a company is selected
     */
    onSelect(event, term, item) {
        document.title = item.dataset.denomination;
        const searchInput = document.getElementById("search-company");
        searchInput.setAttribute("data-siren", item.dataset.siren)
        searchInput.setAttribute("data-denomination", item.dataset.denomination)
        document.getElementById("panel-company").style.display = "";
        getCompanyDetailsUpdatePannelTitle(
            item.dataset.siren,
            item.dataset.denomination
        );
    }
});

/*******************************************************************************
 * Description. GET company details from
 * https://api.enthic.fr/company/siren/. Call companyPanel with the
 * value return to create DOM.
 *
 * @param {String}    siren         SIREN of the company.
 * @param {String}    denomination  Official registered company name.
 */
function getCompanyDetailsUpdatePannelTitle(siren, denomination) {
    // CHANGE THE PANEL HEADER
    const year = document.getElementById("select-year").value;
    const COMPANY_PANEL_DOM_ID = "panel-company-name"
    if (year === "average") {
        document.getElementById(COMPANY_PANEL_DOM_ID).innerText = denomination + " en moyenne";
    } else {
        document.getElementById(COMPANY_PANEL_DOM_ID).innerText = denomination + " en " + year;
    }
    // HTTP POST REQUEST TO api.enthic WITH THE INPUT VALUE
    xhr.open("GET", "https://api.enthic.fr/company/siren/" + siren + "/" + year, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        let panelCompany = document.getElementById("list-company");
        const WHERE_TO_INSERT = 'beforeend'
        panelCompany.innerHTML = "";
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                for (let [data, value] of Object.entries(xhr.response)) {
                    if ("financial_data" === data) { // IF IN THE FINANCIAL PART
                        for (let [code, data] of Object.entries(value)) {
                            let data_description = `${data["description"]} (${code} du ${data["account"]})`
                            panelCompany.insertAdjacentHTML(WHERE_TO_INSERT, `<company-panel description="${data_description}" value="${data["value"]}">`);
                        }
                    } else { // IN IDENTITY
                        panelCompany.insertAdjacentHTML(WHERE_TO_INSERT, `<company-panel description="${value["description"]}" value="${value["value"]}">`);
                    }
                }
            } else if (xhr.status === 404) { // IF NO DATA FOR THIS COMPANY OR YEAR
                panelCompany.innerHTML = `<div class = "panel panel-default">
              <div class = "panel-heading">
                  <h4 class = "panel-title">
                      Aucune donnée pour cette année
                  </h4>
              </div>
          </div>`;
            }
        }
    };
    xhr.send();
}