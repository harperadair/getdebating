/* =========================================================
   GET DEBATING — SHARED SCRIPT
   Kept intentionally small. Two jobs:
   1. Toggle the mobile navigation menu open/closed.
   2. On the contact page, intercept the enquiry form submit
      and show a "not connected yet" message instead of
      actually sending anything (there's no backend).
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  /* ---- 1. Mobile nav toggle ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    /* Close the menu automatically once someone taps a link,
       so it doesn't stay open after navigating on mobile. */
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- 2. Enquiry form: submit to Web3Forms ----
     Web3Forms (web3forms.com) lets a static site send form
     submissions to email without a backend — free for up to
     250 submissions/month. Replace the access_key hidden field
     in contact.html with a real key before this will work. */
  var enquiryForm = document.querySelector("#enquiry-form");
  var formNote = document.querySelector("#form-note");

  if (enquiryForm && formNote) {
    enquiryForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var accessKey = enquiryForm.querySelector('[name="access_key"]');
      var honeypot = enquiryForm.querySelector('[name="botcheck"]');

      // Honeypot check: if this hidden field has a value, silently drop it.
      if (honeypot && honeypot.value) {
        return;
      }

      if (!accessKey || !accessKey.value || accessKey.value.indexOf("[") === 0) {
        formNote.textContent =
          "This form isn't fully set up yet — please email info@getdebating.ie directly for now.";
        formNote.classList.add("is-visible");
        formNote.setAttribute("tabindex", "-1");
        formNote.focus();
        return;
      }

      var submitBtn = enquiryForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      var formData = new FormData(enquiryForm);

      fetch(enquiryForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            enquiryForm.reset();
            formNote.textContent =
              "Thanks — your enquiry has been sent. We'll get back to you soon.";
          } else {
            formNote.textContent =
              "Something went wrong sending that. Please email info@getdebating.ie instead.";
          }
          formNote.classList.add("is-visible");
          formNote.setAttribute("tabindex", "-1");
          formNote.focus();
        })
        .catch(function () {
          formNote.textContent =
            "Something went wrong sending that. Please email info@getdebating.ie instead.";
          formNote.classList.add("is-visible");
          formNote.setAttribute("tabindex", "-1");
          formNote.focus();
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send enquiry";
          }
        });
    });
  }
});
