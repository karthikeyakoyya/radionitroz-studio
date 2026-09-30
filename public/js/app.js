$(function () {
  "use strict";

  var API = "../api";
  var csrfToken = "";

  // Attach the CSRF token to every request the API might reject without it.
  // GETs ignore the header server-side, so this is safe to send always.
  $.ajaxSetup({
    beforeSend: function (xhr) {
      if (csrfToken) {
        xhr.setRequestHeader("X-CSRF-Token", csrfToken);
      }
    }
  });

  function showToast(message) {
    var $toast = $("#toast");
    $toast.text(message).prop("hidden", false);
    setTimeout(function () { $toast.prop("hidden", true); }, 2500);
  }

  function escapeHtml(str) {
    return $("<div>").text(str == null ? "" : str).html();
  }

  function showDashboard(member) {
    if (member.csrf_token) {
      csrfToken = member.csrf_token;
    }
    $("#login-panel").hide();
    $("#dashboard").prop("hidden", false);
    $("#who-am-i").text("Signed in (member #" + member.id + (member.role === "admin" ? ", admin" : "") + ")");
    loadSlots();
    loadSubmissions();
  }

  function showLogin() {
    $("#dashboard").prop("hidden", true);
    $("#login-panel").show();
    $("#who-am-i").text("");
  }

  function checkSession() {
    $.getJSON(API + "/auth/session.php").done(function (res) {
      if (res.authenticated) {
        showDashboard(res);
      } else {
        showLogin();
      }
    }).fail(showLogin);
  }

  function loadSlots() {
    $.getJSON(API + "/slots/list.php").done(function (res) {
      var $body = $("#slots-body").empty();
      if (!res.slots.length) {
        $body.append("<tr><td colspan=\"5\">No slots yet.</td></tr>");
        return;
      }
      $.each(res.slots, function (_, slot) {
        var actionCell = slot.status === "open"
          ? '<button class="book-btn" data-id="' + slot.id + '">Book</button>'
          : escapeHtml(slot.booked_by_name || "Booked");
        var $row = $(
          "<tr>" +
          "<td>" + escapeHtml(slot.show_title) + "</td>" +
          "<td>" + escapeHtml(slot.slot_date) + "</td>" +
          "<td>" + escapeHtml(slot.start_time) + " – " + escapeHtml(slot.end_time) + "</td>" +
          '<td><span class="badge ' + slot.status + '">' + escapeHtml(slot.status) + "</span></td>" +
          "<td>" + actionCell + "</td>" +
          "</tr>"
        );
        $body.append($row);
      });
    });
  }

  function loadSubmissions() {
    $.getJSON(API + "/submissions/list.php").done(function (res) {
      var $body = $("#submissions-body").empty();
      if (!res.submissions.length) {
        $body.append("<tr><td colspan=\"3\">No submissions yet.</td></tr>");
        return;
      }
      $.each(res.submissions, function (_, sub) {
        $body.append(
          "<tr>" +
          "<td>" + escapeHtml(sub.content_title) + "</td>" +
          "<td>" + escapeHtml(sub.submitted_at) + "</td>" +
          '<td><span class="badge ' + sub.status + '">' + escapeHtml(sub.status) + "</span></td>" +
          "</tr>"
        );
      });
    });
  }

  $("#login-form").on("submit", function (e) {
    e.preventDefault();
    var payload = {
      email: $("#email").val(),
      password: $("#password").val()
    };
    $("#login-error").addClass("visually-hidden").text("");

    $.ajax({
      url: API + "/auth/login.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload)
    }).done(function (member) {
      showDashboard(member);
    }).fail(function (xhr) {
      var msg = (xhr.responseJSON && xhr.responseJSON.error) || "Sign-in failed";
      $("#login-error").removeClass("visually-hidden").text(msg);
    });
  });

  $("#logout-btn").on("click", function () {
    $.post(API + "/auth/logout.php").always(showLogin);
  });

  $("#slots-body").on("click", ".book-btn", function () {
    var slotId = $(this).data("id");
    $.ajax({
      url: API + "/slots/book.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ slot_id: slotId })
    }).done(function () {
      showToast("Slot booked");
      loadSlots();
    }).fail(function (xhr) {
      showToast((xhr.responseJSON && xhr.responseJSON.error) || "Could not book slot");
    });
  });

  $("#submission-form").on("submit", function (e) {
    e.preventDefault();
    var payload = {
      content_title: $("#content-title").val(),
      content_notes: $("#content-notes").val()
    };
    $.ajax({
      url: API + "/submissions/create.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload)
    }).done(function () {
      showToast("Submission sent");
      $("#submission-form")[0].reset();
      loadSubmissions();
    }).fail(function (xhr) {
      showToast((xhr.responseJSON && xhr.responseJSON.error) || "Could not submit");
    });
  });

  checkSession();
});
