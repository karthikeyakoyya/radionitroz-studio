angular.module("studioApp", [])
  .controller("SlotsController", ["$http", function ($http) {
    var vm = this;
    var API = "../../api";

    vm.authenticated = false;
    vm.form = { email: "", password: "" };
    vm.loginError = "";
    vm.slots = [];
    vm.statusLine = "";
    vm.toast = "";
    vm.csrfToken = "";

    function authedConfig() {
      return { headers: { "X-CSRF-Token": vm.csrfToken } };
    }

    function showToast(message) {
      vm.toast = message;
      setTimeout(function () {
        vm.toast = "";
      }, 2500);
    }

    function loadSlots() {
      $http.get(API + "/slots/list.php").then(function (res) {
        vm.slots = res.data.slots;
      });
    }

    function checkSession() {
      $http.get(API + "/auth/session.php").then(function (res) {
        if (res.data.authenticated) {
          vm.authenticated = true;
          vm.csrfToken = res.data.csrf_token || "";
          vm.statusLine = "Signed in (member #" + res.data.id + ")";
          loadSlots();
        }
      });
    }

    vm.login = function () {
      vm.loginError = "";
      $http.post(API + "/auth/login.php", vm.form).then(function (res) {
        vm.authenticated = true;
        vm.csrfToken = res.data.csrf_token || "";
        vm.statusLine = "Signed in (member #" + res.data.id + ")";
        loadSlots();
      }, function (res) {
        vm.loginError = (res.data && res.data.error) || "Sign-in failed";
      });
    };

    vm.logout = function () {
      $http.post(API + "/auth/logout.php", {}).then(function () {
        vm.authenticated = false;
        vm.slots = [];
        vm.statusLine = "";
      });
    };

    vm.book = function (slotId) {
      $http.post(API + "/slots/book.php", { slot_id: slotId }, authedConfig()).then(function () {
        showToast("Slot booked");
        loadSlots();
      }, function (res) {
        showToast((res.data && res.data.error) || "Could not book slot");
      });
    };

    checkSession();
  }]);
