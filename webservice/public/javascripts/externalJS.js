// contact data array for filling in info box
var contactListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the contact list on initial page load
    populateContactList();

});

// Functions =============================================================

// Fill contact list with actual data.
function populateContactList() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/contactList', function( data ) {
        contactListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkShowContact" rel="' + this.name + '">' + this.name + '</a></td>';
            tableContent += '<td><a href="#" class="linkDeleteContact" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#contactList table tbody').html(tableContent);
    });
};
// Show Contact Info
function showContactInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve contact name from link rel attribute
    var thisContactName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = contactListData.map(function(arrayItem) { return arrayItem.name; }).indexOf(thisContactName);

    // Get our contact Object
    var thisContactObject = contactListData[arrayPosition];

    //Populate Info Box
    $('#contactInfoName').text(thisContactObject.name);
    $('#contactInfoTel').text(thisContactObject.tel);
    $('#contactInfoEmail').text(thisContactObject.email);

    //record id in “rel” attribute of the contactInfoName field
    $('#contactInfoName').attr({'rel': thisContactObject._id});
};

 // contact name link click
$('#contactList table tbody').on('click', 'td a.linkShowContact', showContactInfo);

// Add or update contact
function addOrUpdateContact(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addOrUpdateContact input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {
        // check if the input contact exists already
        var name = $('#addOrUpdateContact fieldset input#inputContactName').val();
        var existContactIndex = -1;
        for (var i = 0; i < contactListData.length; i++){
            if(contactListData[i].name == name){
                existContactIndex = i;
                break;
            }
        }

        if(existContactIndex >= 0){
            //the contact exists
            var existingContact = {
                '_id': contactListData[existContactIndex]._id,
                'name': $('#addOrUpdateContact fieldset input#inputContactName').val(),
                'tel': $('#addOrUpdateContact fieldset input#inputContactTel').val(),
                'email': $('#addOrUpdateContact fieldset input#inputContactEmail').val()
            }
            updateContact(existingContact);
        } else{
            // the contact is new
            var newContact = {
                'name': $('#addOrUpdateContact fieldset input#inputContactName').val(),
                'tel': $('#addOrUpdateContact fieldset input#inputContactTel').val(),
                'email': $('#addOrUpdateContact fieldset input#inputContactEmail').val()
            }
            // Use AJAX to post the object to our addContact service
            $.ajax({
                type: 'POST',
                data: newContact,
                url: '/users/addContact',
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    // Clear the form inputs
                    $('#addOrUpdateContact fieldset input').val('');
                    // Update the table
                    populateContactList();
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);
                }
            });
        }
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Update Contact
function updateContact(existingContact) {
    var id = existingContact._id;

    $.ajax({
        type: 'PUT',
        url: '/users/updateContact/'+id,
        data: existingContact,
        dataType: 'JSON'
    }).done(function (response) {
        if (response.msg === '') {
            // Clear the form inputs
            $('#addOrUpdateContact fieldset input').val('');

           // Update the table
           populateContactList();

            //Update detailed info if the updated contact's detailed info is displayed
            if (id == $('#contactInfoName').attr('rel')){

              $('#contactInfoName').text(existingContact.name);
              $('#contactInfoTel').text(existingContact.tel);
              $('#contactInfoEmail').text(existingContact.email);

            }

        }
        else {
          // If something goes wrong, alert the error message that our service returned
          alert('Error: ' + response.msg);

        }
    });
};


// Add/Update Contact button click
$('#btnAddUpdateContact').on('click', addOrUpdateContact);

// Delete contact link click
$('#contactList table tbody').on('click', 'td a.linkDeleteContact', deleteContact);

// Delete Contact
function deleteContact(event) {
    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this contact?');

    // Check and make sure the contact confirmed
    if (confirmation === true) {
        // If confirmed, do our delete
       var id = $(this).attr('rel');
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteContact/'+id
        }).done(function( response ) {
          // Update the table
          populateContactList();
          //populate detailed info if the updated contact's detailed info is displayed
          if (id == $('#contactInfoName').attr('rel')){

            $('#contactInfoName').text('');
            $('#contactInfoTel').text('');
            $('#contactInfoEmail').text('');
            $('#contactInfoName').removeAttr('rel');
          }

        });
    }
    else {
        // If saying no to the confirm, do nothing
        return false;
    }
};
