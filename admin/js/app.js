const { createApp } = Vue;

const API = "../api";

createApp({
  data() {
    return {
      authenticated: false,
      loginForm: { email: "", password: "" },
      loginError: "",
      submissions: [],
      filter: "pending",
      toast: "",
      statusLine: "",
      csrfToken: "",
    };
  },
  computed: {
    filteredSubmissions() {
      if (this.filter === "all") return this.submissions;
      return this.submissions.filter((s) => s.status === this.filter);
    },
  },
  methods: {
    authedHeaders() {
      return {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      };
    },
    async checkSession() {
      const res = await fetch(`${API}/auth/session.php`);
      const data = await res.json();
      if (data.authenticated && data.role === "admin") {
        this.authenticated = true;
        this.csrfToken = data.csrf_token || "";
        this.statusLine = `Signed in (admin #${data.id})`;
        await this.loadSubmissions();
      } else if (data.authenticated) {
        this.loginError = "This account is not an admin.";
      }
    },
    async login() {
      this.loginError = "";
      const res = await fetch(`${API}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        this.loginError = data.error || "Sign-in failed";
        return;
      }
      if (data.role !== "admin") {
        this.loginError = "This account is not an admin.";
        return;
      }
      this.authenticated = true;
      this.csrfToken = data.csrf_token || "";
      this.statusLine = `Signed in (admin #${data.id})`;
      await this.loadSubmissions();
    },
    async logout() {
      await fetch(`${API}/auth/logout.php`, { method: "POST" });
      this.authenticated = false;
      this.submissions = [];
      this.statusLine = "";
    },
    async loadSubmissions() {
      const res = await fetch(`${API}/submissions/list.php`);
      const data = await res.json();
      this.submissions = data.submissions || [];
    },
    async review(submissionId, decision) {
      const res = await fetch(`${API}/submissions/review.php`, {
        method: "POST",
        headers: this.authedHeaders(),
        body: JSON.stringify({ submission_id: submissionId, decision }),
      });
      const data = await res.json();
      if (!res.ok) {
        this.showToast(data.error || "Could not update submission");
        return;
      }
      this.showToast(data.message);
      await this.loadSubmissions();
    },
    showToast(message) {
      this.toast = message;
      setTimeout(() => { this.toast = ""; }, 2500);
    },
  },
  mounted() {
    this.checkSession();
  },
}).mount("#app");
