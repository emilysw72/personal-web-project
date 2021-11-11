$(document).ready(function () {
    $("#contactForm").validate({
        debug:true,
        errorClass: "alert alert-danger",
        errorLabelContainer: "$output-area",
        errorElement: "div",
        rules:{
            name: {
                required: true
            },
            email: {
                email: true,
                required: true
            },
            message: {
                required: true,
                maxlength: 2000,
            }
        },
        messages: {
            name: {
                required: "Your name is required."
            },
            email: {
                required: "Your email is required.",
                email: "Please use a valid email address."
            },
            message: {
                required: "You need to include a message.",
                maxlength: "Maximum message length is 2000 characters."
            }
        },
        submitHandler: (form) => {
            $("#contactForm").ajaxSubmit({
                type: "POST",
                url: $("#contactForm").attributes('action'),
                success: (ajaxOutput) => {
                    $('output-area').css("display", "")
                    $('output-area').html(ajaxOutput)
                    if ($(".alert-success" >= 1)) {
                        $("#contactForm") [0].reset()
                    }
                }
            })
        }
    })
})