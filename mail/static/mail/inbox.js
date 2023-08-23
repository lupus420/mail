document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  
  // By default, load the inbox
  load_mailbox('inbox');

});


function clear_display(){
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-list').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-buttons').style.display = 'none';
}


function open_email(email_id){
  clear_display();
  const emails_view = document.querySelector('#emails-view');
  const archive_btn = document.querySelector('#archive_btn');
  const unarchive_btn = document.querySelector('#unarchive_btn');
  emails_view.style.display = 'block';
  document.querySelector('#email-buttons').style.display = 'block';
  
  // Display content of the email
  fetch("/emails/"+email_id)
  .then(response => response.json())
  .then(email => {
    // Enable/disable archive button
    if(email.archived === true){
      archive_btn.setAttribute("disabled", "true");
      unarchive_btn.removeAttribute("disabled");
    }
    else{
      archive_btn.removeAttribute("disabled");
      unarchive_btn.setAttribute("disabled", "true");
    }
    // console.log(email);
    emails_view.innerHTML = `<h2>${email.subject}</h2>`;
    emails_view.innerHTML += `<h5><b>From:</b> ${email.sender}</h5>`;
    emails_view.innerHTML += `<h5><b>To:</b> ${email.recipients}</h5>`;
    emails_view.innerHTML += `<h5><b>Sent:</b> ${email.timestamp}</h5>`;
    emails_view.innerHTML += `<hr>`;
    emails_view.innerHTML += `<p>${email.body}</p><hr>`;

    // Make a reply button
    const reply_btn = document.querySelector('#reply_btn');
    reply_btn.onclick = () => compose_email(
      recipients  = email.sender,
      subject     = `Re: ${email.subject}`,
      body        = `\n\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`);
      
    });
  
  // Mark email as 'read'
  fetch("/emails/"+email_id, {
    method: "PUT",
    body:   JSON.stringify({
      read: true
    })
  });
    
  archive_btn.onclick = async () => {
    await fetch("/emails/"+email_id, {
      method: "PUT",
      body:   JSON.stringify({
        archived: true
      })
    });
    load_mailbox('inbox');
  }

  unarchive_btn.onclick = async () => {
    await fetch("/emails/"+email_id, {
      method: "PUT",
      body:   JSON.stringify({
        archived: false
      })
    });
    load_mailbox('inbox');
  }
}

function compose_email(recipients = "", subject = "", body = "") {
  // Show compose view and hide other views
  clear_display();
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

  if (document.querySelector('#compose-recipients').value !== ''){
    document.querySelector('#compose-body').focus();
    document.querySelector('#compose-body').setSelectionRange(0,0);
  }
  
  document.querySelector('form').onsubmit = () => {
    // Get data from form
    input_recipients  = document.querySelector('#compose-recipients').value;
    input_subject     = document.querySelector('#compose-subject').value;
    input_body        = document.querySelector('#compose-body').value;
    
    // Send request to compose() from views.py
    fetch('/emails',{
      method: 'POST',
      // Convert JS into a JSON string
      body: JSON.stringify({
        recipients: input_recipients,
        subject:    input_subject,
        body:       input_body
      })
    })
    // .then(response => response.json())
    // .then(result => {
    //   // Print result in the console
    //   console.log(result);
    // });
    load_mailbox('sent');
  }
}


function list_emails(emails) {
  clear_display();
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-list').style.display = 'block';

  const sentView = document.getElementById('email-list');
  sentView.innerHTML = '';
  sentView.classList.add('list-group');
  
  // Use Bootstrap CSS styling
  emails.forEach(email => {
    const emailDiv = document.createElement('button');
    emailDiv.classList.add('email', 'list-group-item', 'list-group-item-action', 'd-flex', 'border', 'border-secondary-subtle');

    const emailContent = document.createElement('div');
    emailContent.innerHTML = `Subject: ${email.subject}, To: ${email.recipients}`;

    const emailDate = document.createElement('div');
    emailDate.classList.add('ms-auto', 'fst-italic');
    emailDate.innerHTML = `${email.timestamp}`;

    if (email.archive === true){
      emailDiv.classList.add('italic');
    }

    if (email.read === true){
      emailDiv.classList.add('bg-body-tertiary');
      emailDiv.classList.remove('fw-bold');
    }
    else{
      emailContent.classList.add('fw-bold');
      emailDiv.classList.add('bg-secondary-subtle');
    }

    emailDiv.appendChild(emailContent);
    emailDiv.appendChild(emailDate);

    // Add onclick function to open email
    emailDiv.onclick = () => open_email(email.id);
    
    //Add email id as a attribute, so after clicking on it open_email(email_id) can be called
    emailDiv.setAttribute('data-email-id', email.id);
    sentView.appendChild(emailDiv);
  });
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  clear_display();
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // fetch is used to make a web request and get all emails
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    // console.log(emails);
    list_emails(emails);
  });
}