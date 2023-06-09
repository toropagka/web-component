class FormComponent extends HTMLElement {
  constructor() {
    super();
  }

  //рендерим макет формы
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .row_content,
        .input_content {
          font-size: 1rem;
          padding: 0.25rem;
          padding-right: 2rem;
          border: 1px solid black;
          color: black;
          min-width: 18rem;
          min-height: 1.5rem;
          width: 100%;
          margin-top: 1rem;

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
          top: 4.5rem;
          left: 0;
          background-color: white;
          width: 100%;
          min-width: 18rem;
          z-index: 10;
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

        .container_input {
          position: relative;
        }

        .container_input input {
          width: 100%;
        }

        .container_input .input_button-reset {
          color: red;
          position: absolute;
          bottom: .5rem;
          right: -2rem;
          cursor: pointer;
          display: none;
          background: transparent;
          border: none;
        }
      </style>
      
      <section class="container">
        <label for="company"><strong>Компания или ИП</strong><label>
        <div class="container_input">
          <input type="text" class="input_content" id="company" name="party"  placeholder="Введите название организации"/>
          <button type="button" class="input_button-reset" id="button_reset">&#10006;</button>
        </div>
        <div id="company_list" class="company_list">

        </div>
        <div id="company_status" class="company_status"></div>
      </section>

      <section class="result">
        <div class="result_row">
          <label for="name_short">Краткое наименование</label>
          <div class="row_content" id="name_short"></div>
        </div>
        <div class="row">
          <label for="name_full">Полное наименование</label>
          <div class="row_content" id="name_full"></div>
        </div>
        <div class="row">
          <label for="inn_kpp">ИНН / КПП</label>
          <div class="row_content" id="inn_kpp"></div>
        </div>
        <div class="row">
          <label for="address">Адрес</label>
          <div class="row_content" id="address"></div>
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
    this.buttonReset = this.shadowRoot.getElementById('button_reset');
    this.companyList = this.shadowRoot.getElementById('company_list');
    this.companyName = this.shadowRoot.getElementById('company');

    this.companyName.addEventListener(
      'input',
      this.addInputListener.bind(this)
    );

    this.buttonReset.addEventListener('click', this.resetForm.bind(this));

    this.companyList.addEventListener('click', this.addListListener.bind(this));

    this.URL =
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';

    this.companiesList = [];
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

  //шаблон для каждого айтем списка
  companyItem(value, inn, address) {
    return `
      <div class='company_item' data-id='${inn}'>
        <div class="item_title">${value}</div>
        <div class="item_description">${inn}</div>
        <div class="item_description item_description__block">${address}</div>
      </div>
    `;
  }
  //функция вывода списка компаний по названию
  showCompanyList(companies) {
    const companiesNode = companies.reduce((acc, { value, data }) => {
      return (acc = [
        ...acc,
        this.companyItem(value, data.inn, data.address.value),
      ]);
    }, []);

    this.companyList.innerHTML = companiesNode.join('');
  }

  //добавляем данные в соответствующие поля
  addValueInFields(company) {
    const { value, data } = company;
    const { state, name, inn, kpp, address } = data;

    this.companyName.value = value;
    this.companyStatus.textContent = `Статус: ${state.status}`;
    this.shortName.textContent = name.short;
    this.fullName.textContent = name.full_with_opf;
    this.personalNumber.textContent = `${inn} / ${kpp}`;
    this.address.textContent = address.unrestricted_value;
  }

  //сброс полей по кнопке сброса
  resetForm() {
    this.companyName.value =
      this.companyStatus.textContent =
      this.shortName.textContent =
      this.fullName.textContent =
      this.personalNumber.textContent =
      this.address.textContent =
        '';
    this.companyList.style.display = 'none';
    this.buttonReset.style.display = 'none';
  }

  //запускаем процесс обращения к АПИ т ртсуем список подходящих компаний
  addInputListener({ target }) {
    let value = target.value;

    if (!value) {
      this.resetForm();
    } else {
      this.buttonReset.style.display = 'inline';

      this.loadCompanies(value).then((companies) => {
        if (!companies?.length) {
          this.companyList.style.display = 'none';
          this.companiesList = [];
        }

        this.companiesList = companies;
        this.showCompanyList(companies);
        this.companyList.style.display = 'block';
      });
    }
  }

  //запускаем добавление данных по клику на нужную компанию
  addListListener({ target }) {
    const parentElementID = target.parentElement.dataset.id;

    const company = this.companiesList.find((company) => {
      return company.data.inn === parentElementID;
    });

    company && this.addValueInFields(company);
    this.companyList.style.display = 'none';
  }
}

// сообщим браузеру, что <form-component> обслуживается нашим новым классом
customElements.define('form-component', FormComponent);
