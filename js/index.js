/* INITIALIZATION OF THE AUTOCOMPLETE FOR COMPANY INPUT USING PIXABAY VANILLA
LIBRARY, NO DEPENDENCY. SOURCE FROM https://github.com/Pixabay/JavaScript-autoComplete */
var xhr = new XMLHttpRequest();
var autocomplete = new autoComplete({
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
        var choices = [];
        for (let [siren, denomination] of Object.entries(xhr.response)) {
          choices.push(denomination);
        }
        response(choices);
      }
    };
    var data = JSON.stringify({ "probe": term, "limit": 20 });
    xhr.send(data);
  },
  // TRIGGERED WHEN A COMPANY IS SELECTED
  onSelect: function (e, denomination, item) {
    var year = document.getElementById("select-year").value;
    document.title = denomination;
    document.getElementById("panel-company").style.display = "";
    getCompanyDetails(denomination, year);
  }
});
function createListElement(key, value) {
  if (['GOOD'].includes(value)) {
    return createListClass("success", key, value)
  }
  else if (['TIGHT'].includes(value)) {
    return createListClass("danger", key, value)
  }
  else {
    return createListClass("info", key, value)
  }
}
function createListClass(alertType, key, value) {
  return '<li class="list-group-item">' + key + ': <div class="alert alert-' + alertType + '">' + value.toLocaleString("fr-FR") + '</div></li>'
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
      var list = "";
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
  var companyDenomination = document.getElementById("search-company").value
  var year = document.getElementById("select-year").value
  if (companyDenomination != "") {
    getCompanyDetails(companyDenomination, year)
  }
}