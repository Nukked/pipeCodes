import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import ReactDOM from "react-dom";
//import Modal from 'react-bootstrap/Modal'
//import ModalBody from "react-bootstrap/ModalBody";
//import ModalHeader from "react-bootstrap/ModalHeader";
//import ModalFooter from "react-bootstrap/ModalFooter";
//import ModalTitle from "react-bootstrap/ModalTitle";

class App extends Component {
  // inicializa o state, contem a informação da tabela
  state = {
    data: [],
    id: 0,
    name: null,
    intervalIsSet: false,
  };
  // Monta o componente e faz a chamada para obter os dados na base de dados
  // Depois fica à escuta e caso exista alguma alteração na base de dados o componente mostra essas alterações
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }
  // Serve para não deixar processos vivos depois de usados
  // Duvidas
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // Metodo usado para chamar o getData do servidor 
  // para trazer os dados da base de dados
  getDataFromDb = () => {
    fetch('http://localhost:3001/api/questions')
      .then((data) => data.json())
      .then((res) => this.setState({ data: res.data }));
  };

  // Metodo usado para chamar o o putData que esta do lado do servidor
  // serve para fazer a query e guardar os dados na base de dados
  putDataToDB = (name, email, observations, date) => {
    let currentIds = this.state.data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post('http://localhost:3001/api/questions', {
      id: idToBeAdded,
      name: name,
      email: email,
      observations: observations,
      date: date,
    });
  };

  // Handler para fazer o set dos valores inseridos no formulario
  changeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({[nam]: val});
  }

  // Handler para fazer a validação e o submit dos valores inseridos no formulario 
  submitHandler = (event) => {
    event.preventDefault();
    let hasErrors = false;
    let errorMessage = "";
    // Valida se foi preenchido o campo nome
    if (!this.state.name) {
      hasErrors = true;
      errorMessage += '- Name is required \n';
    }
    // Valida se foi preenchido o campo email e se este é valido
    if (!this.state.email || !new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.email)) {
      hasErrors = true;
      errorMessage += '- Email is required or invalid \n';
    }
    // Valida se foi preenchido o campo observações
    if (!this.state.observations) {
      hasErrors = true;
      errorMessage += '- Observations is required \n';
    }

    // Valida se foi preenchido o campo data
    if (!this.state.date) {
      hasErrors = true;
      errorMessage += '- Date is required';
    }

    // Criar data do dia seguinte para validação
    var tomorrow = new Date();
    tomorrow.setHours(1,0,0,0); // Set para as 01h 
    // as horas precisam de estar a zero para que a validação corra como esperado
    tomorrow.setDate(tomorrow.getDate() + 1);
    if(new Date(this.state.date) <= tomorrow){
      hasErrors = true;
      // O set das horas (1,0,0,0) foi feito para aparecer o seguinte dia na proxima linha de codigo
      // se não aparecia 23h do mesmo dia
      errorMessage += '- Date must be greater then ' + tomorrow.toISOString().substring(0,10);
    }

    // Se houve erros durante a validação então mostra as mensagens de erro e não deixa avançar
    if(hasErrors) {
      alert(errorMessage);
      return;
    }
    // Caso tenha corrido tudo bem então avança para submeter os valores na base de dados
    else {
      alert("Submiting values...");
      this.putDataToDB(this.state.name, this.state.email, this.state.observations, this.state.date)
    }
  }
  
  // Render do frontend
  render() {
    return (
      <div>
        <h1 style={{display: 'flex', justifyContent: 'center'}}>Questions</h1>
        <ReactTable
          data={this.state.data}
          getTdProps={this.getRowInfo}
          // Definição das colunas da React-Table e os seus id,
          // que servem para ir buscar a informação à variavel data
          columns={[
            {
              Header: "Questions",
              columns: [
                {
                  id: "name",
                  Header: "Name",
                  accessor: "name"
                },
                {
                  id: "email",
                  Header: "Email",
                  accessor: "email"
                },
                {
                  id: "observations",
                  Header: "Observations",
                  accessor: "observations"
                },
                {
                  id: "date",
                  Header: "Date",
                  accessor: "date"
                },
              ]
            }
          ]}
          defaultPageSize={20}
          className="-striped -highlight"
        />
        <br />
        <br />
        <br />
        <br />
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <form onSubmit={this.submitHandler}>
            <h1>New Question</h1>
            <p>Name:</p>
            <input
              type='text'
              name='name'
              onChange={this.changeHandler}
            />
            <p>Email:</p>
            <input
              type='text'
              name='email'
              onChange={this.changeHandler}
            />
            <p>Observations:</p>
            <input
              type='text'
              name='observations'
              onChange={this.changeHandler}
            />
            <p>Date:</p>
            <input
              type='date'
              name='date'
              onChange={this.changeHandler}
            />
            <input
              type='submit' value="Submit"
            />
          </form>
        </div>
      </div>
    );
  }
}

export default App;
