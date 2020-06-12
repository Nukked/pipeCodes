import React, { Component } from 'react';
import { Form, Field } from "simple-react-forms";
import axios from 'axios';
import ReactTable from "react-table-6";
import "react-table-6/react-table.css"; 

class App extends Component {
  // initialize our state
  state = {
    data: [],
    id: 0,
    message: null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null,
    objectToUpdate: null,
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // never let a process live forever
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify
  // data base entries

  // our first get method that uses our backend api to
  // fetch data from our data base
  getDataFromDb = () => {
    fetch('http://localhost:3001/api/getData')
      .then((data) => data.json())
      .then((res) => this.setState({ data: res.data }));
  };

  // our put method that uses our backend api
  // to create new query into our data base
  putDataToDB = (message) => {
    let currentIds = this.state.data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post('http://localhost:3001/api/putData', {
      id: idToBeAdded,
      message: message,
    });
  };

  onClickHandler() {
    console.log(this.refs["simpleForm"].getFormValues());
    let obj = this.refs["simpleForm"].getFormValues();
    fetch("http://localhost:3001/api/putData", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj)
    });
  }

  // here is our UI
  // it is easy to understand their functions when you
  // see them render into our screen
  render() {
    return (
      <div>
      <br />
        <br />
        <Form ref="simpleForm">
          <Field name="avenger" label="Enter your name" type="text" />
          <Field name="weapon" label="Your weapon" type="text" />
        </Form>
        <button className="submitBtn" onClick={this.putDataToDB(this)}>
          Submit
        </button>
        <br />
        <br />
        <br />
        <ReactTable
          data={this.state.data}
          getTdProps={this.getRowInfo}
          columns={[
            {
              Header: "Questions",
              columns: [
                { 
                  id: "id", 
                  Header: "ID",
                  accessor: "_id" 
                },
                {
                  id: "name",
                  Header: "Name",
                  accessor: "id"
                },
                {
                  id: "message",
                  Header: "Message",
                  accessor: "message"
                },
              ]
            }
          ]}
          defaultPageSize={1}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

export default App;
