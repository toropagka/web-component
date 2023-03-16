class FormComponent extends HTMLElement {
  constructor() {
    super();
  }

  //рендерим макет формы
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        input {
          font-size: 16px;
          padding: 4px;
          border: 1px solid black;
          color: black;
        }

        .company_status {
          margin-top: .5rem;
          color:grey;
        }
        
        .result {
          width: 70%;
          min-width: 300px;
        }
        
        .row {
          margin-top: 1em;
        }
        
        .row label {
          display: block;
          min-width: 10em;
        }
        
        .row input,
        .row textarea {
          width: 100%;
        }
      </style>
      
      <section class="container">
        <p><strong>Компания или ИП</strong></p>
        <input id="company" name="party" type="text" placeholder="Введите название, ИНН, ОГРН или адрес организации" disabled/>
        <div id="company_status" class="company_status"></div>
      </section>

      <section class="result">
        <p id="type"></p>
        <div class="row">
          <label>Краткое наименование</label>
          <input id="name_short" disabled>
        </div>
        <div class="row">
          <label>Полное наименование</label>
          <input id="name_full" disabled>
        </div>
        <div class="row">
          <label>ИНН / КПП</label>
          <input id="inn_kpp">
        </div>
        <div class="row">
          <label>Адрес</label>
          <input id="address" disabled>
        </div>
      </section>
    `;

    this.companyName = this.shadowRoot.getElementById('company');
    this.companyStatus = this.shadowRoot.getElementById('company_status');
    this.shortName = this.shadowRoot.getElementById('name_short');
    this.fullName = this.shadowRoot.getElementById('name_full');
    this.address = this.shadowRoot.getElementById('address');
    this.inputOptions = this.shadowRoot.getElementById('companyList');
    this.companyItems = this.shadowRoot.querySelectorAll('.company_item');
    this.personalNumber = this.shadowRoot.getElementById('inn_kpp');

    this.personalNumber.addEventListener(
      'keydown',
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
      console.log(data);
      return data.suggestions.filter((company) => company.data.inn);
    } catch (error) {
      return console.error(error);
    }
  }

  //добавляем данные в соответствующие поля
  showCompanyList(companies) {
    const company = companies[0];

    this.companyName.value = company.value;
    this.companyStatus.textContent = `Статус: ${company.data.state.status}`;
    this.shortName.value = company.data.name.short;
    this.fullName.value = company.data.name.full_with_opf;
    this.personalNumber.value = `${company.data.inn} / ${company.data.kpp}`;
    this.address.value = company.data.address.unrestricted_value;
  }

  //запускаем процесс обращения к АПИ и добавление данных по клику на кнопку
  addInputListener(e) {
    let query = this.personalNumber.value;
    console.log(query);
    if (e.key === 'Enter')
      this.loadCompanies(query).then((companies) =>
        this.showCompanyList(companies)
      );
  }
}

// сообщим браузеру, что <form-component> обслуживается нашим новым классом
customElements.define('form-component', FormComponent);
