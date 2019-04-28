import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import $ from 'jquery';

class ContactPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      displayContact: {
        'name': '',
        'tel': '',
        'email': ''
      },
      newContactName: '',
      newContactTel: '',
      newContactEmail: '',
    };
    this.handleDisplayInfo = this.handleDisplayInfo.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleTelChange = this.handleTelChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleAddOrUpdateSubmit = this.handleAddOrUpdateSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDisplayInfo(contact) {
    this.setState({
      displayContact: {
        'name': contact.name,
        'tel': contact.tel,
        'email': contact.email
      }
    });
  }

  componentDidMount() {
    this.loadContacts();
  }

  loadContacts() {
    $.ajax({
      url: "http://localhost:3001/users/contactList",
      dataType: 'json',
      success: function(data) {
        this.setState({
          contacts: data
        });
      }.bind(this),
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
    });
  }

  handleNameChange(name) {
    this.setState({
      newContactName: name
    });
  }

  handleTelChange(tel) {
    this.setState({
      newContactTel: tel
    });
  }

  handleEmailChange(email) {
    this.setState({
      newContactEmail: email
    });
  }

  handleAddOrUpdateSubmit(e) {
    e.preventDefault(e);

    if (this.state.newContactName === '' || this.state.newContactTel === '' || this.state.newContactEmail === '') {
      alert('Please fill in all fields');
    } else {
      var existingIndex = -1;

      for (var i = 0; i < this.state.contacts.length; i++) {
        if (this.state.newContactName === this.state.contacts[i].name) {
          existingIndex = i;
          break;
        }
      }

      if (existingIndex >= 0) {
        var existingContact = {
          "_id": this.state.contacts[existingIndex]._id,
          "name": this.state.newContactName,
          "tel": this.state.newContactTel,
          "email": this.state.newContactEmail
        }
        this.handleUpdate(existingIndex, existingContact);
      } else {
        $.post("http://localhost:3001/users/addContact", {
            "name": this.state.newContactName,
            "tel": this.state.newContactTel,
            "email": this.state.newContactEmail
          },
          function(data, status) {
            if (data.msg === '') {
              this.loadContacts();
              this.setState({
                newContactName: '',
                newContactTel: '',
                newContactEmail: ''
              });
            } else
              alert(data.msg);
          }.bind(this)
        );
      }
    }
  }

  handleUpdate(existingIndex, existingContact) {
    $.ajax({
      type: "put",
      url: "http://localhost:3001/users/updateContact/" + existingContact._id,
      data: existingContact,
      dataType: "json",
      success: function(data) {
        //update contacts
        this.loadContacts();

        this.setState({
          newContactName: '',
          newContactTel: '',
          newContactEmail: ''
        });
        if (this.state.displayContact.name === existingContact.name) {
          this.handleDisplayInfo(existingContact);
        }
      }.bind(this),
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
    });
  }

  handleDelete(e) {
  e.preventDefault(e);

  var confirmation = window.confirm('Are you sure you want to delete this contact?');
  if (confirmation === true) {

    var name = e.target.parentNode.parentNode.firstChild.innerText;
    var id = e.target.rel;
    $.ajax({
        type: 'delete',
        url: "http://localhost:3001/users/deleteContact/" + id,
        dataType: 'json',
        success: function(data) {
          //implement the deletion of the deleted contact from the contacts state
          //and the display under “Contact Info”
          this.loadContacts();
          if (this.state.displayContact.name === name) {
            this.setState({
              displayContact: {
                'name': '',
                'tel': '',
                'email': ''
              }
            });
          }
      }.bind(this),
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
    });
}
}


  render() {
    return (
      <div id="wrapper">
              <h1> Lab 8</h1>
              <p>Welcome to Lab 8.</p>
              <ContactInfo
                displayContact={this.state.displayContact}/>

              <h2> Contact List </h2>
              <ContactList
                contacts={this.state.contacts}
                handleDisplayInfo={this.handleDisplayInfo}
                handleDelete={this.handleDelete}/>

              <h2> Add/Update Contact </h2>
     <AddOrUpdateContactForm
          newContactName={this.state.newContactName}
          newContactTel={this.state.newContactTel}
          newContactEmail={this.state.newContactEmail}
          onNameChange={this.handleNameChange}
          onTelChange={this.handleTelChange}
          onEmailChange={this.handleEmailChange}
          handleAddOrUpdateSubmit={this.handleAddOrUpdateSubmit}
          displayContact={this.state.displayContact}/>

            </div>



    );
  }
}

class ContactInfo extends React.Component {
  render() {
    const contact = this.props.displayContact;
    return (
      <div>
        <h2>Contact Info</h2>
        <p id="leftP">
          <strong>Name:</strong> <span>{contact.name}</span><br></br>
          <strong>Telephone:</strong> <span>{contact.tel}</span><br></br>
          <strong>Email:</strong> <span>{contact.email}</span>
        </p>
      </div>

    );
  }
}

class ContactList extends React.Component {
  constructor(props) {
    super(props);
    this.handleDisplayInfo = this.handleDisplayInfo.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDisplayInfo(contact) {
    this.props.handleDisplayInfo(contact);
  }

  handleDelete(e) {
    this.props.handleDelete(e);
  }

  render() {
    let rows = [];
    this.props.contacts.map((contact, i) => {
      rows.push(
        <ContactRow key={i} contact = {contact}
        handleDisplayInfo = {this.handleDisplayInfo}
        handleDelete = {this.handleDelete} />
      );
    });

    return (
      <div id="contactList">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Delete?</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      </div>

    );
  }
}

class ContactRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleDisplayInfo = this.handleDisplayInfo.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

  }

  handleDisplayInfo(e) {
    e.preventDefault(e);
    this.props.handleDisplayInfo(this.props.contact);
  }
  handleDelete(e) {
    e.preventDefault(e);
    this.props.handleDelete(e);
  }

  render() {
    const contact = this.props.contact;

    return (
      <tr>
        <td><a href="" onClick={this.handleDisplayInfo} rel={contact.name}>{contact.name}</a></td>
        <td><a href="" onClick={this.handleDelete} rel={contact._id}>delete</a></td>
      </tr>

    );
  }
}

class AddOrUpdateContactForm extends React.Component {
  constructor(props) {
    super(props);

    //bind this to functions
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleTelChange = this.handleTelChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleAddOrUpdateSubmit = this.handleAddOrUpdateSubmit.bind(this);
  }

  handleNameChange(e) {
    e.preventDefault(e);
    this.props.onNameChange(e.target.value);
  }

  handleTelChange(e) {
    e.preventDefault(e);
    this.props.onTelChange(e.target.value);
  }

  handleEmailChange(e) {
    e.preventDefault(e);
    this.props.onEmailChange(e.target.value);
  }

  handleAddOrUpdateSubmit(e) {
    e.preventDefault(e);
    this.props.handleAddOrUpdateSubmit(e);
  }

  render() {
    return (
      <div>
              <form>
                <input className="input_text"
                  type="text"
                  placeholder = "Name"
                  value={this.props.newContactName}
                  onChange={this.handleNameChange}
                />
                <br/>

                <input className="input_text"
                  type="text"
                  placeholder = "Telephone Number"
                  value={this.props.newContactTel}
                  onChange={this.handleTelChange}
                />
                <br/>
                <input className="input_text"
                  type="text"
                  placeholder = "Email"
                  value={this.props.newContactEmail}
                  onChange={this.handleEmailChange}
                />
                <br/>

                <button className="myButton" onClick={this.handleAddOrUpdateSubmit}>Add/Update Contact</button>
              </form>
            </div>
    );
  }
}


export default ContactPage;
