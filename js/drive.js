/* ===================================================
   ALUMLY DRIVE — COMPLETE CONTROLLER (js/drive.js)
   Supabase Auth, Cloudflare R2, Alpine.js, GSAP & Animations
=================================================== */

const SUPABASE_URL = "https://mswgpxjbvzulvehstaqc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KM7WN3oE_z-r2tWFgxXgRA_4R3x_vWr";
const R2_WORKER_URL = "https://r2-upload-signer.serroukhyassir2006.workers.dev";

const sbClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ===================================================
// 1. ALPINE.JS APPLICATION STATE & METHODS
// ===================================================
document.addEventListener("alpine:init", () => {
  Alpine.data("alumlyApp", () => ({
    currentView: "drive",
    isLoading: false,
    currentUser: null,
    mobileNavOpen: false,

    isAuthModalOpen: false,
    authTab: "login",
    loginEmail: "",
    loginPassword: "",
    loginError: "",
    registerSubmitted: false,
    regForm: {
      name: "",
      email: "",
      password: "",
      filiere: "MPSI / MP",
      promo: "2026",
    },

    isUploadModalOpen: false,
    newResource: {
      title: "",
      description: "",
      matiere: "maths",
      filiere: "MPSI / MP",
      type: "Fiches",
      tags: "",
    },

    viewMode: "grid",
    searchQuery: "",
    selectedFiliere: "Tous",
    selectedMatiere: "all",
    selectedType: "Tous",
    onlyStarred: false,
    onlyMyPublications: false,
    sortBy: "stars",

    resources: [],
    registrationRequests: [],
    userStarredIds: new Set(),

    filieres: ["Tous", "MP2I / MPI", "MPSI / MP", "PCSI / PC", "PSI"],
    matieres: [
      { id: "all", label: "Toutes les matières", icon: "📚" },
      { id: "maths", label: "Mathématiques", icon: "📐" },
      { id: "physique", label: "Physique & Chimie", icon: "⚡" },
      { id: "info", label: "Informatique", icon: "💻" },
      { id: "francais", label: "Français-Philo", icon: "📖" },
      { id: "anglais", label: "Anglais", icon: "🌍" },
    ],
    types: ["Tous", "Fiches", "DS / Concours", "Cours", "Exercices / TD"],

    async init() {
      if (!sbClient) {
        console.warn(
          "Supabase n'est pas initialisé. Vérifiez vos identifiants.",
        );
        return;
      }

      sbClient.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await this.fetchUserProfile(session.user);
        } else {
          this.currentUser = null;
        }
        await this.loadResources();
      });

      await this.loadResources();
    },

    goToDrive() {
      this.currentView = "drive";
      this.onlyMyPublications = false;
      this.selectedMatiere = "all";
      this.selectedType = "Tous";
      this.selectedFiliere = "Tous";
      this.onlyStarred = false;
      this.searchQuery = "";
    },

    showMyResources() {
      if (!this.currentUser) {
        this.openAuthModal("login");
        return;
      }
      this.currentView = "drive";
      this.onlyMyPublications = true;
      this.onlyStarred = false;
      this.selectedMatiere = "all";
      this.selectedType = "Tous";
      this.selectedFiliere = "Tous";
      this.searchQuery = "";
    },

    async fetchUserProfile(user) {
      try {
        const { data } = await sbClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          this.currentUser = {
            id: user.id,
            name: data.full_name,
            email: user.email,
            role: data.role,
            filiere: data.filiere,
            promo: data.promo,
          };
          if (this.currentUser.role === "admin") {
            await this.loadRegistrationRequests();
          }
        } else {
          this.currentUser = {
            id: user.id,
            name: user.email.split("@")[0],
            email: user.email,
            role: "student",
          };
        }
      } catch (err) {
        console.error("Erreur profil :", err);
      }
    },

    async handleLogin() {
      this.loginError = "";
      this.isLoading = true;
      try {
        const { error } = await sbClient.auth.signInWithPassword({
          email: this.loginEmail.toLowerCase().trim(),
          password: this.loginPassword,
        });
        if (error) throw error;
        this.isAuthModalOpen = false;
        this.loginPassword = "";
        this.showToast("Connexion réussie !");
      } catch (err) {
        this.loginError = err.message || "Erreur de connexion.";
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      if (sbClient) await sbClient.auth.signOut();
      this.currentUser = null;
      this.goToDrive();
      this.userStarredIds.clear();
      this.showToast("Déconnexion effectuée.");
    },

    async loadResources() {
      if (!sbClient) return;
      try {
        const { data, error } = await sbClient
          .from("resources")
          .select("*")
          .order("stars", { ascending: false });

        if (error) throw error;

        this.resources = (data || []).map((r) => ({
          ...r,
          isStarred: this.userStarredIds.has(r.id),
        }));

        if (this.currentUser) {
          const { data: userStars } = await sbClient
            .from("user_stars")
            .select("resource_id")
            .eq("user_id", this.currentUser.id);

          if (userStars) {
            this.userStarredIds = new Set(userStars.map((s) => s.resource_id));
            this.resources.forEach((r) => {
              r.isStarred = this.userStarredIds.has(r.id);
            });
          }
        }
      } catch (err) {
        console.error("Erreur chargement ressources :", err);
      }
    },

    async toggleStar(item) {
      if (!this.currentUser) {
        this.openAuthModal("login");
        return;
      }
      const wasStarred = item.isStarred;
      item.isStarred = !wasStarred;
      item.stars = (item.stars || 0) + (item.isStarred ? 1 : -1);

      try {
        if (item.isStarred) {
          this.userStarredIds.add(item.id);
          await sbClient
            .from("user_stars")
            .insert({ user_id: this.currentUser.id, resource_id: item.id });
        } else {
          this.userStarredIds.delete(item.id);
          await sbClient
            .from("user_stars")
            .delete()
            .match({ user_id: this.currentUser.id, resource_id: item.id });
        }
        await sbClient
          .from("resources")
          .update({ stars: item.stars })
          .eq("id", item.id);
      } catch (err) {
        console.error("Erreur favori :", err);
      }
    },

    async triggerDownload(item) {
      item.downloads = (item.downloads || 0) + 1;
      try {
        await sbClient
          .from("resources")
          .update({ downloads: item.downloads })
          .eq("id", item.id);
      } catch (err) {
        console.error("Erreur compteur téléchargement :", err);
      }
      this.showToast(`Ouverture de : ${item.title}`);
    },

    async handleUploadResource(event) {
      const fileInput = event.target.querySelector('input[type="file"]');
      const file = fileInput?.files[0];
      if (!file || !this.newResource.title) {
        alert("Veuillez renseigner un titre et sélectionner un fichier PDF.");
        return;
      }

      this.isLoading = true;
      try {
        const uploadRes = await fetch(R2_WORKER_URL, {
          method: "POST",
          headers: {
            "Content-Type": file.type || "application/pdf",
            "X-File-Name": encodeURIComponent(file.name),
            "X-File-Type": file.type || "application/pdf",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(
            errData.error || "Échec de l'envoi vers Cloudflare R2",
          );
        }

        const { publicUrl } = await uploadRes.json();

        const tagsArray = this.newResource.tags
          ? this.newResource.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        const { error: dbError } = await sbClient.from("resources").insert({
          title: this.newResource.title,
          description: this.newResource.description,
          matiere: this.newResource.matiere,
          filiere: this.newResource.filiere,
          type: this.newResource.type,
          author: this.currentUser?.name || "Anonyme",
          year: new Date().getFullYear().toString(),
          file_url: publicUrl,
          tags: tagsArray,
        });

        if (dbError) throw dbError;

        this.isUploadModalOpen = false;
        this.newResource = {
          title: "",
          description: "",
          matiere: "maths",
          filiere: "MPSI / MP",
          type: "Fiches",
          tags: "",
        };
        if (fileInput) fileInput.value = "";
        await this.loadResources();
        this.showToast("Ressource publiée avec succès !");
      } catch (err) {
        console.error("Erreur upload :", err);
        alert("Échec de l'upload : " + err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async submitRegistrationRequest(event) {
      const fileInput = event.target.querySelector('input[type="file"]');
      const file = fileInput?.files[0];

      if (
        !this.regForm.name ||
        !this.regForm.email ||
        !this.regForm.password ||
        !file
      ) {
        alert("Remplissez tous les champs et joignez votre justificatif.");
        return;
      }
      if (this.regForm.password.length < 6) {
        alert("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      this.isLoading = true;
      try {
        const fileExt = file.name.split(".").pop();
        const cleanName = this.regForm.name.trim().replace(/\s+/g, "_");
        const filePath = `justificatifs/${Date.now()}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await sbClient.storage
          .from("proofs")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await sbClient
          .from("registration_requests")
          .upsert(
            {
              full_name: this.regForm.name.trim(),
              email: this.regForm.email.toLowerCase().trim(),
              password: this.regForm.password,
              filiere: this.regForm.filiere,
              promo: parseInt(this.regForm.promo, 10),
              proof_url: filePath,
              status: "pending",
            },
            { onConflict: "email" },
          );

        if (dbError) throw dbError;

        this.regForm.password = "";
        if (fileInput) fileInput.value = "";
        this.registerSubmitted = true;
      } catch (err) {
        console.error("Erreur soumission :", err);
        alert("Erreur lors de la soumission : " + err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async loadRegistrationRequests() {
      if (!sbClient) return;
      try {
        const { data, error } = await sbClient
          .from("registration_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        this.registrationRequests = data || [];
      } catch (err) {
        console.error("Erreur demandes :", err);
      }
    },

    get pendingCount() {
      return this.registrationRequests.filter((r) => r.status === "pending")
        .length;
    },

    async approveRequest(req) {
      if (
        !confirm(
          `Valider et créer le compte pour ${req.full_name} (${req.email}) ?`,
        )
      ) {
        return;
      }
      this.isLoading = true;
      try {
        const { error } = await sbClient.functions.invoke("approve-user", {
          body: { requestId: req.id },
        });
        if (error) throw error;
        req.status = "approved";
        this.showToast(`Compte validé pour ${req.full_name} !`);
      } catch (err) {
        console.error("Erreur validation :", err);
        alert("Échec de l'approbation : " + err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async rejectRequest(req) {
      try {
        const { error } = await sbClient
          .from("registration_requests")
          .update({ status: "rejected" })
          .eq("id", req.id);

        if (error) throw error;
        req.status = "rejected";
        this.showToast("Demande refusée.");
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    },

    async previewProof(req) {
      try {
        const { data, error } = await sbClient.storage
          .from("proofs")
          .createSignedUrl(req.proof_url, 60);

        if (error) throw error;
        window.open(data.signedUrl, "_blank");
      } catch (err) {
        alert("Impossible d'ouvrir le justificatif : " + err.message);
      }
    },

    openAuthModal(tab) {
      this.authTab = tab;
      this.registerSubmitted = false;
      this.loginError = "";
      this.isAuthModalOpen = true;
    },

    getStatusLabel(status) {
      switch (status) {
        case "pending":
          return "En attente";
        case "approved":
          return "Approuvé";
        case "rejected":
          return "Rejeté";
        default:
          return status;
      }
    },

    filteredResources() {
      let list = this.resources.filter((item) => {
        const query = this.searchQuery
          ? this.searchQuery.toLowerCase().trim()
          : "";
        const matchQuery =
          query === "" ||
          (item.title && item.title.toLowerCase().includes(query)) ||
          (item.description &&
            item.description.toLowerCase().includes(query)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)));

        const matchMatiere =
          this.selectedMatiere === "all" ||
          item.matiere === this.selectedMatiere;
        const matchType =
          this.selectedType === "Tous" || item.type === this.selectedType;
        const matchFiliere =
          this.selectedFiliere === "Tous" ||
          item.filiere === this.selectedFiliere ||
          item.filiere === "Tous";

        const matchStarred = !this.onlyStarred || item.isStarred;
        const matchMyPubs =
          !this.onlyMyPublications ||
          (this.currentUser && item.author === this.currentUser.name);

        return (
          matchQuery &&
          matchMatiere &&
          matchType &&
          matchFiliere &&
          matchStarred &&
          matchMyPubs
        );
      });

      if (this.sortBy === "stars") {
        list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
      } else if (this.sortBy === "downloads") {
        list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      } else if (this.sortBy === "recent") {
        list.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );
      }

      return list;
    },

    countByMatiere(matiereId) {
      if (matiereId === "all") return this.resources.length;
      return this.resources.filter((r) => r.matiere === matiereId).length;
    },

    getMatiereLabel(id) {
      const mat = this.matieres.find((m) => m.id === id);
      return mat ? mat.label : id;
    },

    showToast(msg) {
      const toast = document.getElementById("toastNotice");
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3200);
    },
  }));
});

// ===================================================
// 2. CURSEUR DOUBLE PERSONNALISÉ
// ===================================================
function initCustomCursor() {
  const cursor_circle = document.querySelector(".cursor-circle");
  const cursor = document.querySelectorAll(".cursor");
  const touchNoHover = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;

  if (!touchNoHover && cursor.length) {
    const interactiveSelector =
      "a, button, .btn, .getHover, input, select, textarea, .asset-card, [role='button'], label, summary";

    window.addEventListener("mousemove", (e) => {
      const target =
        e.target instanceof Element
          ? e.target
          : e.target && e.target.parentElement;

      cursor.forEach((el) => {
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.classList.add("is-visible");
      });

      if (cursor_circle) {
        cursor_circle.classList.toggle(
          "biggerCursor",
          Boolean(target && target.closest(interactiveSelector)),
        );
      }
    });

    document.documentElement.addEventListener("mouseleave", () => {
      cursor.forEach((el) => el.classList.remove("is-visible"));
      if (cursor_circle) cursor_circle.classList.remove("biggerCursor");
    });
  }
}

// ===================================================
// 3. ANIMATIONS GSAP CIBLÉES & FIABLES
// ===================================================
function initDriveAnimations() {
  if (typeof gsap === "undefined") return;

  // Timeline Hero d'entrée (visible dès l'ouverture de la page)
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .from(".drive-showcase nav", {
      y: -20,
      opacity: 0,
      duration: 0.8,
    })
    .from(
      ".comment-hero",
      {
        y: 15,
        opacity: 0,
        duration: 0.6,
      },
      "-=0.5",
    )
    .from(
      ".big-name",
      {
        y: 40,
        opacity: 0,
        duration: 0.9,
      },
      "-=0.4",
    )
    .from(
      ".drive-hero-desc",
      {
        y: 20,
        opacity: 0,
        duration: 0.7,
      },
      "-=0.5",
    )
    .from(
      ".scroll-indicator",
      {
        opacity: 0,
        duration: 0.6,
      },
      "-=0.4",
    )
    .from(
      ".bottom-section",
      {
        y: 15,
        opacity: 0,
        duration: 0.6,
      },
      "-=0.5",
    );

  // Animation Footer ScrollTrigger (play none none reverse pour ne jamais vider la page)
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(".site-footer__meta", { opacity: 0, y: 28 });
    gsap.set(".site-footer__brand", { opacity: 0, y: 48 });
    gsap.set(".site-footer__line", { opacity: 0, y: 24 });
    gsap.set(".site-footer__nav a", { opacity: 0, y: 20 });
    gsap.set(".site-footer__base", { opacity: 0, y: 20 });

    const footerTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 88%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    footerTl
      .to(".site-footer__meta", { opacity: 1, y: 0, duration: 0.5 })
      .to(".site-footer__brand", { opacity: 1, y: 0, duration: 0.7 }, 0.1)
      .to(".site-footer__line", { opacity: 1, y: 0, duration: 0.55 }, 0.28)
      .to(
        ".site-footer__nav a",
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.45 },
        0.35,
      )
      .to(".site-footer__base", { opacity: 1, y: 0, duration: 0.5 }, 0.5);
  }
}

function onDOMReady() {
  initCustomCursor();
  initDriveAnimations();

  // Raccourci Clavier ⌘K / Ctrl+K
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const searchInput = document.querySelector(".drive-search-box input");
      if (searchInput) searchInput.focus();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onDOMReady);
} else {
  onDOMReady();
}
