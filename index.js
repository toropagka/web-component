'use strict';

const companyName = document.getElementById('company');
const shortName = document.getElementById('name_short');
const fullName = document.getElementById('name_full');
const personalNumber = document.getElementById('inn_kpp');
const address = document.getElementById('address');
const inputOptions = document.getElementById('companyList');
const companyItem = document.querySelectorAll('.company_item');

const URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';

const token = 'e71d0ae7e3697701556584111e59e3b3c91397a6';

async function loadCompanies(query) {
  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Token ' + token,
    },
    body: JSON.stringify({ query: query }),
  };

  try {
    const response = await fetch(URL, options);
    const data = await response.json();

    return data.suggestions.filter((company) => company.data.inn);
  } catch (error) {
    return console.error(error);
  }
}

function showCompanyList(companies) {
  const company = companies[0];
  console.log(...companies);
  console.log(company);

  companyName.value = `${company.value}`;
  shortName.value = `${company.data.name.short}`;
  fullName.value = `${company.data.name.full_with_opf}`;
  personalNumber.value = `${company.data.inn} / ${company.data.kpp}`;
  address.value = `${company.data.address.unrestricted_value}`;
}

personalNumber.addEventListener('keydown', function (e) {
  let query = this.value;
  if (e.key === 'Enter')
    loadCompanies(query).then((companies) => showCompanyList(companies));
});

// const companyName = document.getElementById('company');
// const shortName = document.getElementById('name_short');
// const fullName = document.getElementById('name_full');
// const personalNumber = document.getElementById('inn_kpp');
// const address = document.getElementById('address');
// const inputOptions = document.getElementById('companyList');
// const companyItem = document.querySelectorAll('.company_item');

// const URL =
//   'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';

// const token = 'e71d0ae7e3697701556584111e59e3b3c91397a6';

// async function loadCompanies(query) {
//   const options = {
//     method: 'POST',
//     mode: 'cors',
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//       'Authorization': 'Token ' + token,
//     },
//     body: JSON.stringify({ query: query }),
//   };

//   try {
//     const response = await fetch(URL, options);
//     const data = await response.json();
//     console.log(data);

//     return data.suggestions.filter((company) =>
//       company.value.toLowerCase().includes(query.toLowerCase())
//     );
//   } catch (error) {
//     return console.error(error);
//   }
// }

// function showCompanyList(companies) {
//   inputOptions.innerHTML = '';
//   companies.forEach((company) => {
//     inputOptions.innerHTML += `
//     <div class='company_item'  data-id='${company.data.inn}'>
//         <div class="item_title">${company.value}</div>

//           <span class="item_description">${company.data.inn}</span>
//           <span class="item_description">${company.data.address.value}</span>
//         </div>
//         <div>
//         </div>
//     `;
//     // const option = document.createElement('option');
//     // option.value = company.value;
//     // option.textContent = company.value;
//     // inputOptions.appendChild(option);
//   });
//   if (companies.length > 0) {
//     inputOptions.style.display = 'block';
//   } else {
//     inputOptions.style.display = 'none';
//   }
// }

// companyName.addEventListener('input', function () {
//   let query = this.value;

//   loadCompanies(query).then((companies) => showCompanyList(companies));
// });

// companyItem.forEach((item) => {
//   item.addEventListener('click', (e) => e.stopPropagation());
// });

// inputOptions.addEventListener('click', (e) => {
//   const parentElement = e.target.parentElement;
//   console.log(parentElement);
// });
