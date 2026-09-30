function SubmissionsViewModel() {
  var self = this;
  var API = "../../api";

  self.authenticated = ko.observable(false);
  self.form = { email: ko.observable(""), password: ko.observable("") };
  self.loginError = ko.observable("");
  self.statusLine = ko.observable("");
  self.toast = ko.observable("");
  self.submissions = ko.observableArray([]);
  self.filter = ko.observable("all");
  self.newTitle = ko.observable("");
  self.newNotes = ko.observable("");
  self.csrfToken = "";

  self.filteredSubmissions = ko.computed(function () {
    var f = self.filter();
    var all = self.submissions();
    if (f === "all") return all;
    return all.filter(function (s) { return s.status === f; });
  });

  function showToast(message) {
    self.toast(message);
    setTimeout(function () { self.toast(""); }, 2500);
  }

  function authedHeaders() {
    return {
      "Content-Type": "application/json",
      "X-CSRF-Token": self.csrfToken
    };
  }

  function loadSubmissions() {
    fetch(API + "/submissions/list.php")
      .then(function (r) { return r.json(); })
      .then(function (data) { self.submissions(data.submissions || []); });
  }

  function checkSession() {
    fetch(API + "/auth/session.php")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.authenticated) {
          self.authenticated(true);
          self.csrfToken = data.csrf_token || "";
          self.statusLine("Signed in (member #" + data.id + ")");
          loadSubmissions();
        }
      });
  }

  self.login = function () {
    self.loginError("");
    fetch(API + "/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: self.form.email(), password: self.form.password() })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) {
          self.loginError(res.data.error || "Sign-in failed");
          return;
        }
        self.authenticated(true);
        self.csrfToken = res.data.csrf_token || "";
        self.statusLine("Signed in (member #" + res.data.id + ")");
        loadSubmissions();
      });
  };

  self.logout = function () {
    fetch(API + "/auth/logout.php", { method: "POST" }).then(function () {
      self.authenticated(false);
      self.submissions([]);
      self.statusLine("");
    });
  };

  self.submit = function () {
    fetch(API + "/submissions/create.php", {
      method: "POST",
      headers: authedHeaders(),
      body: JSON.stringify({ content_title: self.newTitle(), content_notes: self.newNotes() })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) {
          showToast(res.data.error || "Could not submit");
          return;
        }
        showToast("Submission sent");
        self.newTitle("");
        self.newNotes("");
        loadSubmissions();
      });
  };

  checkSession();
}

ko.applyBindings(new SubmissionsViewModel());
