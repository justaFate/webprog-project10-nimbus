$(document).ready(function() {
    var token = localStorage.getItem('token');

    if (window.location.pathname === '/user/profile') {
        if (!token) {
            alert("You are not logged in! Please sign in to continue.");
            window.location.href = "/login";
            return;
        }

        $('#currentToken').text(token);

        loadUserProfile();

        $('#btnTestUser').click(function() {
            loadUserProfile(true);
        });

        $('#btnTestAdmin').click(function() {
            $.ajax({
                type: 'GET',
                url: '/users',
                headers: { 'Authorization': 'Bearer ' + token },
                success: function(users) {
                    $('#apiTestResult').html(
                        '<div class="alert alert-success"><strong>Success (ADMIN Role):</strong> Retrieved ' +
                        users.length + ' users from the system.</div>'
                    );
                },
                error: function(xhr) {
                    var errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Access denied";
                    $('#apiTestResult').html(
                        '<div class="alert alert-danger"><strong>Failed (HTTP ' + xhr.status + '):</strong> ' +
                        errorMsg + '</div>'
                    );
                }
            });
        });
    }

    function loadUserProfile(isManualClick) {
        $.ajax({
            type: 'GET',
            url: '/users/me',
            dataType: 'json',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(data) {
                $('#profileName').text(data.fullName);
                $('#profileEmail').text(data.email);
                $('#profileId').text(data.id);
                $('#profileCreatedAt').text(data.createdAt ? new Date(data.createdAt).toLocaleString('en-US') : 'N/A');

                var roleBadge = $('#profileRole');
                roleBadge.text(data.role || 'ROLE_USER');
                if (data.role === 'ROLE_ADMIN') {
                    roleBadge.removeClass('bg-secondary bg-primary').addClass('bg-danger');
                } else {
                    roleBadge.removeClass('bg-secondary bg-danger').addClass('bg-primary');
                }

                if (isManualClick) {
                    $('#apiTestResult').html(
                        '<div class="alert alert-success"><strong>Success:</strong> Valid user details retrieved from Nimbus JWT!</div>'
                    );
                }
            },
            error: function(xhr) {
                alert("Your session has expired or is invalid!");
                localStorage.removeItem('token');
                window.location.href = "/login";
            }
        });
    }

    $('#btnLogin').click(function() {
        var email = $('#loginEmail').val().trim();
        var password = $('#loginPassword').val().trim();

        if (!email || !password) {
            $('#loginFeedback').html('<div class="alert alert-warning py-2">Please enter both email and password.</div>');
            return;
        }

        $('#btnLogin').prop('disabled', true).text('Signing in...');

        $.ajax({
            type: "POST",
            url: "/auth/login",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ email: email, password: password }),
            success: function(data) {
                localStorage.setItem('token', data.token);
                window.location.href = "/user/profile";
            },
            error: function(xhr) {
                var message = "Sign in failed. Please check your credentials.";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }
                $('#loginFeedback').html('<div class="alert alert-danger py-2">' + message + '</div>');
                $('#btnLogin').prop('disabled', false).text('Sign In');
            }
        });
    });

    $('#btnRegister').click(function() {
        var fullName = $('#regFullName').val().trim();
        var email = $('#regEmail').val().trim();
        var password = $('#regPassword').val().trim();

        if (!fullName || !email || !password) {
            $('#registerFeedback').html('<div class="alert alert-warning py-2">Please fill in all required fields.</div>');
            return;
        }

        if (password.length < 6) {
            $('#registerFeedback').html('<div class="alert alert-warning py-2">Password must be at least 6 characters long.</div>');
            return;
        }

        $('#btnRegister').prop('disabled', true).text('Creating account...');

        $.ajax({
            type: "POST",
            url: "/auth/signup",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ fullName: fullName, email: email, password: password }),
            success: function(data) {
                $('#registerFeedback').html('<div class="alert alert-success py-2">Registration successful! You can now sign in.</div>');
                $('#btnRegister').prop('disabled', false).text('Create Account');
                setTimeout(function() {
                    $('#login-tab').tab('show');
                    $('#loginEmail').val(email);
                    $('#loginPassword').val('');
                }, 1200);
            },
            error: function(xhr) {
                var message = "Registration failed.";
                if (xhr.responseJSON) {
                    if (xhr.responseJSON.validationErrors) {
                        message = Object.values(xhr.responseJSON.validationErrors).join("<br>");
                    } else if (xhr.responseJSON.message) {
                        message = xhr.responseJSON.message;
                    }
                }
                $('#registerFeedback').html('<div class="alert alert-danger py-2">' + message + '</div>');
                $('#btnRegister').prop('disabled', false).text('Create Account');
            }
        });
    });

    $('#logout').click(function() {
        localStorage.removeItem('token');
        window.location.href = "/login";
    });
});
