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
    // TRIGGERED WHEN A COMPANY IS SELECTED
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
 * @param {type}    siren         SIREN of the company.
 * @param {type}    denomonation  Official registered company name.
 */
function getCompanyDetailsUpdatePannelTitle(siren, denomination) {
    // CHANGE THE PANEL HEADER
    const year = document.getElementById("select-year").value;
    if (year === "average") {
        document.getElementById("panel-company-name").innerText = denomination + " en moyenne";
    } else {
        document.getElementById("panel-company-name").innerText = denomination + " en " + year;
    }
    // HTTP POST REQUEST TO api.enthic WITH THE INPUT VALUE
    xhr.open("GET", "https://api.enthic.fr/company/siren/" + siren + "/" + year, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        let panels = "";
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                for (let [bundle, value] of Object.entries(xhr.response)) {
                    if ("financial_data" === bundle) { // IF IN THE FINANCIAL PART
                        for (let [code, bundle] of Object.entries(value)) {
                            let bundle_description = `${bundle["description"]} (${code} du ${bundle["account"]})`
                            panels += companyPanel(bundle_description, bundle["value"]);
                        }
                    } else { // IN IDENTITY
                        panels += companyPanel(value["description"], value["value"]);
                    }
                }
            } else if (xhr.status === 404) {
                panels += `<div class = "panel panel-default">
              <div class = "panel-heading">
                  <h4 class = "panel-title">
                      Aucune donnée pour cette année
                  </h4>
              </div>
          </div>`;
            }
        }
        document.getElementById("list-company").innerHTML = panels;
    };
    xhr.send();
}

/*******************************************************************************
 * Summary. Generate a Bootstrap panel HTML DOM for a company.
 *
 * Description. The company panel contains details about the company. It
 * uses the bootstrap library to be collapsible and save space. Value are
 * financial amount and to be converted to French local for thousand
 * separation. Inherit from String because HTML is one.
 *
 * @param {String}          bundle bundle from company details
 * @param {String, Number}  value Value from company details
 *
 * @return {Object} Object containing the DOM HTML as value.
 */
function companyPanel(bundle, value) {
    const uniqueId = new domId(bundle)
    return `<div class = "panel panel-default">
              <div class = "panel-heading" data-toggle="collapse" href = "#${uniqueId.id}" style="cursor:pointer;">
                  <h4 class = "panel-title">
                      <a data-toggle="collapse" href="#${uniqueId.id}">${bundle}</a>
                  </h4>
              </div>
              <div id="${uniqueId.id}" class="panel-collapse collapse">
                  <div class="alert alert-info">${value.toLocaleString("fr-FR")}</div>
              </div>
          </div>`;
}

/*******************************************************************************
 * Class domId
 */
class domId extends String {
    /***************************************************************************
     * Summary. Generate an DOM id based on a String
     *
     * Description. Uses hash function to create a valid most likely unique id
     * from any String. Epoch time is ms * random [0,1[ string is concatenate to
     * the former string. Inherit from String because id attribute is one.
     *
     * @param {String}  s   String to hash.
     *
     * @return {Object}     Object containing the DOM id as value.
     */
    constructor(s) {
        let hash = 0;
        const d = new Date();
        const t = d.getTime();
        //ADD TIME AND RANDOM FOR BETTER CHANCES TO HAVE A UNIQUE ID
        s = s + String(t * Math.random())
        for (let i = 0; i < s.length; i++) {
            let character = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // CONVERT TO 32BIT INTEGER
        }
        super(hash);
        return {"id": String(this)};
    }
}
