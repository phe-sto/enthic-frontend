/*******************************************************************************
 * EVENT FIRED WHEN CHANGED THE YEAR OR SELECTING AVERAGE DATA
 */
document.getElementById("select-year").addEventListener("change", function () {
  // CALL getCompanyDetails WHEN YEAR OR AVERAGE CHANGES
  getCompanyDetails(document.getElementById("search-company").value.split(", ")[1],
    document.getElementById("select-year").value);
});
/*******************************************************************************
 * INITIALIZATION OF THE AUTOCOMPLETE FOR COMPANY INPUT USING PIXABAY VANILLA
 * LIBRARY, NO DEPENDENCY. SOURCE FROM
 * https://github.com/Pixabay/JavaScript-autoComplete
 */
var xhr = new XMLHttpRequest();
new autoComplete({
  selector: '#search-company',
  minChars: 1,
  source: function (term, response) {
    term = term.toUpperCase();
    // HTTP POST REQUEST TO api.enthic WITH THE INPUT VALUE
    xhr.open("POST", "http://api.enthic.fr/company/search/", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let choices = [];
        let i = 0
        while (i < xhr.response.totalItems) {
          choices.push(xhr.response.member[i].siren.value + ", " + xhr.response.member[i].denomination.value)
          i++
        }
        response(choices);
      }
    };
    let data = JSON.stringify({ "probe": term, "limit": 100 });
    xhr.send(data);
  },
  // TRIGGERED WHEN A COMPANY IS SELECTED
  onSelect: function (_, sirenDenomination) {
    $(".alert").alert('close'); // TODO Replace ugly JQuery
    let year = document.getElementById("select-year").value;
    let denomination = sirenDenomination.split(", ")[1];
    document.title = denomination;
    document.getElementById("panel-company").style.display = "";
    getCompanyDetails(denomination, year);
  }
});
/*******************************************************************************
 * Summary. Create Boostrap panel for each company data.
 *
 * Description. Create Boostrap panel for each company data with
 * the appropriate Boostrap alert.
 *
 * @param {type}    key     Key from the company data.
 * @param {String}  value   Value from the company data.
 *
 * @return {String} HTML from the companyPanel instance.
 */
function createListElement(key, value, classification = "UNKNOWN") {
  let panel;
  if (classification === "GOOD") {
    panel = companyPanel("success", key, value);
  }
  else if (classification === 'TIGHT') {
    panel = companyPanel("danger", key, value);
  }
  else if (classification === "AVERAGE") {
    panel = companyPanel("info", key, value);
  }
  else {
    panel = companyPanel("warning", key, value);
  }
  return panel;
}
/*******************************************************************************
 * Summary. GET company details from
 * http://api.enthic.fr/company/denomination/.
 *
 * Description. GET company details from
 * http://api.enthic.fr/company/denomination/. Call createListElement with the
 * value return to create DOM.
 *
 * @param {type}    denomination Official registered company name.
 * @param {String}  year         Year as a 4 character string, i.e. YYYY.
 */
function getCompanyDetails(denomination, year) {
  // CHANGE THE PANEL HEADER
  if (year === "average") {
    document.getElementById("panel-company-name").innerText = denomination + " en moyenne";
  }
  else {
    document.getElementById("panel-company-name").innerText = denomination + " en " + year;
  }
  // HTTP POST REQUEST TO api.enthic WITH THE INPUT VALUE
  xhr.open("GET", "http://api.enthic.fr/company/denomination/" + denomination + "/" + year, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.responseType = "json";
  xhr.onreadystatechange = function () {
    let panels = "";
    if (xhr.readyState === 4 && xhr.status === 200) {
      for (let [key, value] of Object.entries(xhr.response)) {

        if ("financial_data" === key) { // IF IN THE DESIRED BUNDLE
          let l = value.length;
          while (l--) {
            for (let [code, bundle] of Object.entries(value[l])) {
              let bundle_description = `${bundle["description"]} (${code} du ${bundle["account"]})`
              if (bundle.hasOwnProperty('classification')) {
                panels += createListElement(bundle_description, bundle["value"], bundle['classification']["value"]);
              } else {
                panels += createListElement(bundle_description, bundle["value"]);
              }

            }
          }
        } else { // IN IDENTITY
          panels += createListElement(value["description"], value["value"]);
        }
      }
    }
    document.getElementById("list-company").innerHTML = panels;
  };
  xhr.send();
}
/*******************************************************************************
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
function companyPanel(alertType, key, value) {
  let uniqueId = new domId(key)
  return `<div class = "panel panel-default">
              <div class = "panel-heading" data-toggle="collapse" href = "#${uniqueId.id}" style="cursor:pointer;">
                  <h4 class = "panel-title">
                      <a data-toggle="collapse" href="#${uniqueId.id}">${key}</a>
                  </h4>
              </div>
              <div id="${uniqueId.id}" class="panel-collapse collapse">
                  <div class="alert alert-${alertType}">${value.toLocaleString("fr-FR")}</div>
              </div>
          </div>`;
}
/*******************************************************************************
 * CLASS domId
 */
class domId extends String {
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
    return { "id": String(this) };
  }
}
