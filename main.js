class FormComponent extends HTMLElement {
  constructor() {
    super();
  }

  //рендерим макет формы
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        input,
        .content {
          font-size: 16px;
          padding: 4px;
          border: 1px solid black;
          color: black;
          min-width: 18rem;
          min-height: 1.5rem;
          width: 100%;

        }
        .company_status {
          margin-top: .5rem;
          color:grey;
        }
        .result,
        .container {
          width: 70%;
          height: auto;
          margin: 0 auto;
        }
        .container {
          margin-top: 3rem;
          position: relative;
        }
        .company_list {
          position: absolute;
          top: 3.5rem;
          left: 0;
          background-color: white;
          width: 100%;
          min-width: 18rem;

        }
        .row {
          margin-top: 1em;
        }
        .row label {
          display: block;
          min-width: 10em;
        }
        .row input {
          width: 100%;
        }
        .company_item {
          padding-left: .5rem;
          width: 100%;
          color: #3e4040;
        }
        .item_description__block {
          width: 100%;
        }
        .item_title {
          padding-top: .5rem;
        }
      </style>
      
      <section class="container">
        <label for="company"><strong>Компания или ИП</strong><label>
        <input type="text" class="content" id="company" name="party"  placeholder="Введите название организации"/>
        <div id="company_list" class="company_list"></div>
        <div id="company_status" class="company_status"></div>
      </section>

      <section class="result">
        <p id="type"></p>
        <div class="row">
          <label for="name_short">Краткое наименование</label>
          <div class="content" id="name_short"></div>
        </div>
        <div class="row">
          <label for="name_full">Полное наименование</label>
          <div class="content" id="name_full"></div>
        </div>
        <div class="row">
          <label for="inn_kpp">ИНН / КПП</label>
          <div class="content" id="inn_kpp"></div>
        </div>
        <div class="row">
          <label for="address">Адрес</label>
          <div class="content" id="address"></div>
        </div>
      </section>
    `;
    //сделал не в виде формы с инпутами/текстареа, тк здесь просто отображаем поступившую с сервера информацию.
    //Пользователь сам вводит только название. Оно реализовано инпутом.

    this.companyStatus = this.shadowRoot.getElementById('company_status');
    this.shortName = this.shadowRoot.getElementById('name_short');
    this.fullName = this.shadowRoot.getElementById('name_full');
    this.address = this.shadowRoot.getElementById('address');
    this.companyItems = this.shadowRoot.querySelectorAll('.company_item');
    this.personalNumber = this.shadowRoot.getElementById('inn_kpp');

    this.companyList = this.shadowRoot.getElementById('company_list');
    this.companyName = this.shadowRoot.getElementById('company');

    this.companyName.addEventListener(
      'input',
      this.addInputListener.bind(this)
    );

    this.URL =
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';
  }

  //делаем запрос в АПИ
  async loadCompanies(query) {
    const token = 'e71d0ae7e3697701556584111e59e3b3c91397a6';

    const options = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Token ' + token,
      },
      body: JSON.stringify({ query }),
    };

    try {
      const response = await fetch(this.URL, options);
      const data = await response.json();
      return data.suggestions.filter((company) => company.data.inn);
    } catch (error) {
      throw Error(error);
    }
  }

  //выводим список компаний по названию
  showCompanyList(companies) {
    this.companyList.innerHTML = '';
    companies.forEach((company) => {
      this.companyList.innerHTML += `
        <div class='company_item'  data-id='${company.data.inn}'>
          <div class="item_title">${company.value}</div>

          <div class="item_description">${company.data.inn}</div>
          <div class="item_description item_description__block">${company.data.address.value}</div>
        </div>
    `;
    });
    if (companies.length > 0) {
      this.companyList.style.display = 'block';
      this.companyList.style.border = '1px solid grey';
    } else {
      this.companyList.style.display = 'none';
    }
  }

  //добавляем данные в соответствующие поля
  addValueInFields(company) {
    this.companyName.value = company.value;
    this.companyStatus.textContent = `Статус: ${company.data.state.status}`;
    this.shortName.textContent = company.data.name.short;
    this.fullName.textContent = company.data.name.full_with_opf;
    this.personalNumber.textContent = `${company.data.inn} / ${company.data.kpp}`;
    this.address.textContent = company.data.address.unrestricted_value;
  }

  //запускаем процесс обращения к АПИ и добавление данных по клику на нужную компанию
  addInputListener() {
    let query = this.companyName.value;
    this.loadCompanies(query).then((companies) => {
      this.showCompanyList(companies);

      this.companyList.addEventListener('click', (e) => {
        const parentElementID = e.target.parentElement.dataset.id;
        const company = companies.find(
          (company) => company.data.inn === parentElementID
        );
        this.addValueInFields(company);
        this.companyList.style.display = 'none';
      });
    });
  }
}

// сообщим браузеру, что <form-component> обслуживается нашим новым классом
customElements.define('form-component', FormComponent);
