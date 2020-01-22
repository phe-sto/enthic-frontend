// IMPORT SIMPLE DOM ID CREATOR BASED ON A HASH FUNCTION
import companyPanel from "./company-panel.js";
/* INITIALIZATION OF THE AUTOCOMPLETE FOR COMPANY INPUT USING PIXABAY VANILLA
LIBRARY, NO DEPENDENCY. SOURCE FROM https://github.com/Pixabay/JavaScript-autoComplete */
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
function createListElement(key, value) {
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
function createListClass(alertType, key, value) {
  let uniqueId = new domId(key)
  return '<div class = "panel panel-default"><div class = "panel-heading" data-toggle = "collapse" href = "#' + uniqueId.id + '" style="cursor:pointer;"><h4 class = "panel-title"><a data-toggle="collapse" href="#' + uniqueId.id + '">' + key + '</a></h4></div>'
    + '<div id="' + uniqueId.id + '" class="panel-collapse collapse"><div class="alert alert-' + alertType + '">' + value.toLocaleString("fr-FR") + '</div></div></div>'
}
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
document.getElementById("select-year").addEventListener("change", checkCompany)
function checkCompany() {
  let companyDenomination = document.getElementById("search-company").value
  let year = document.getElementById("select-year").value
  if (companyDenomination != "") {
    getCompanyDetails(companyDenomination, year)
  }
}