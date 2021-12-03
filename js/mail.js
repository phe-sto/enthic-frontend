'use strict';
/*******************************************************************************
 * When the send button is clicked, check the form, show the modal request
 * @return {undefined}
 **/
document.getElementById("send-message").addEventListener("click", function (event) {
    // The form HTML element
    const form = document.getElementById("contact-form");
    // Only POST to the server if form is complete
    if (form.reportValidity() === true) {
        const formData = new FormData(form);
        $.ajax({
            type: "post",
            url: "https://vps1.papit.fr/contact/",
            scriptCharset: "utf-8",
            processData: false,
            contentType: false,
            async: false,
            data: formData,
            // Show modal before sending the request
            beforeSend: function () {
                $('#waiting-modal').modal('show');
            },
            // inject the alert to .messages div in our form
            success: function () {
                $('#contact-form').find('.messages').html('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&#10062;</button>Votre message a été envoyé</div>');
            },
            error: function () {
                $('#contact-form').find('.messages').html("<div class='alert alert-danger alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&#10062;</button>Erreur serveur, votre message n'a pas été envoyé.</div>");
            },
            // Once the response is received, hide the modal and reset the form
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
    }
    return false;
}, false)
