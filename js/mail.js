/*******************************************************************************
 * when the send button is clicked
 * @return {boolean}   Boolean, true if form is okay, false on contrary.
 * */
$('#send-message').click(function (e) {
    // if the validator does not prevent form submit
    if (!e.isDefaultPrevented()) {

        // Get the form and check for datas in it
        const firstName = document.getElementById("form-firstname").value
        if (firstName === "") {
            return false;
        }
        const lastName = document.getElementById("form-lastname").value
        if (lastName === "") {
            return false;
        }
        let phone = document.getElementById("form-phone").value
        if (phone === "") {
            phone = "NON RENSEIGNE";
        }
        const email = document.getElementById("form-email").value
        if (email === "") {
            return false;
        }
        const message = document.getElementById("form-message").value
        if (message === "") {
            return false;
        }
        // POST values in the background the the script URL
        $.ajax({
            type: "post",
            url: "https://vps1.papit.fr/contact/",
            scriptCharset: "utf-8",
            async: false,
            data: {
                "firstname": firstName,
                "lastname": lastName,
                "phone": phone,
                "email": email,
                "message": message,
            },
            beforeSend: function () {
                $('#waiting-modal').modal('show');
            },
            success: function () {
                // inject the alert to .messages div in our form
                $('#contact-form').find('.messages').html('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&#10062;</button>Votre message a pas été envoyé</div>');
            },
            error: function () {
                $('#contact-form').find('.messages').html("<div class='alert alert-danger alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&#10062;</button>Erreur serveur, votre message n'a pas été envoyé.</div>");
            },
            complete: function () {
                // empty the form
                $('#contact-form')[0].reset();
                $('#waiting-modal').modal('hide');
                setTimeout(function () {
                    $('#contact-modal').modal('hide');
                }, 2000)
                return true;
            }
        });
        return false;
    }
})
