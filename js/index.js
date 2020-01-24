/*******************************************************************************
 * IMPORT COMPANY PANEL FORMATER AND UMAN READABLE KEY
 */
import companyPanel from "./company-panel.js";
import humanKey from "./translator.js"
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
    xhr.open("POST", "https://api.enthic.fr/company/search/", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let choices = [];
        for (let [_, denomination] of Object.entries(xhr.response)) {
          choices.push(denomination);
        }
        response(choices);
      }
    };
    let data = JSON.stringify({ "probe": term, "limit": 20 });
    xhr.send(data);
  },
  // TRIGGERED WHEN A COMPANY IS SELECTED
  onSelect: function (_, denomination) {
    let year = document.getElementById("select-year").value;
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
function createListElement(key, value) {
  if (key in humanKey.humanKey) {
    key = humanKey.humanKey[key]
  }
  let panel;
  if (['GOOD'].includes(value)) {
    panel = new companyPanel("success", key, value)
  }
  else if (['TIGHT'].includes(value)) {
    panel = new companyPanel("danger", key, value)
  }
  else {
    panel = new companyPanel("info", key, value)
  }
  return panel.html
}
/*******************************************************************************
 * Summary. GET company details from
 * https://api.enthic.fr/company/denomination/.
 *
 * Description. GET company details from
 * https://api.enthic.fr/company/denomination/. Call createListElement with the
 * value return to create DOM.
 *
 * @param {type}    denomination Official registered company name.
 * @param {String}  year         Year as a 4 character string, i.e. YYYY.
 */
function getCompanyDetails(denomination, year) {
  // CHANGE THE PANEL HEADER
  if (year === "") {
    document.getElementById("panel-company-name").innerText = denomination + " en moyenne";
  }
  else {
    document.getElementById("panel-company-name").innerText = denomination + " en " + year;
  }
  // HTTP POST REQUEST TO api.enthic WITH THE INPUT VALUE
  xhr.open("GET", "https://api.enthic.fr/company/denomination/" + denomination + "/" + year, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.responseType = "json";
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let list = "";
      for (let [key, value] of Object.entries(xhr.response)) {
        if (typeof value === 'object') {
          list += createListElement(value["description"], value["value"])
        }
        else {
          list += createListElement(key, value)
        }
      }
      document.getElementById("list-company").innerHTML = list;
    }
  };
  xhr.send();
};
/*******************************************************************************
 * EVENT FIRED WHEN CHANGED THE YEAR OR SELECTING AVERAGE DATA
 */
document.getElementById("select-year").addEventListener("change", function () {
  // CALL getCompanyDetails WHEN YEAR OR AVERAGE CHANGES
  getCompanyDetails(document.getElementById("search-company").value,
    document.getElementById("select-year").value)
})