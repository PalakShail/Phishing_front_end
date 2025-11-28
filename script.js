// Simple front-end only phishing check (rule based, not real AI)
document.addEventListener("DOMContentLoaded", function () {
    var checkBtn = document.getElementById("checkBtn");
    var input = document.getElementById("userInput");
    var resultBox = document.getElementById("resultBox");

    checkBtn.addEventListener("click", function () {
        var text = (input.value || "").trim();

        if (text.length === 0) {
            showResult("Please paste a URL or message first.", "none", []);
            return;
        }

        var reasons = [];
        var lower = text.toLowerCase();

        // Only for demo – some basic patterns

        // 1. Urgent / fear-triggering words
        if (
            lower.includes("verify your account") ||
            lower.includes("your account will be blocked") ||
            lower.includes("suspend your account") ||
            lower.includes("login immediately") ||
            lower.includes("click here to verify")
        ) {
            reasons.push("Message is using urgent language (account will be blocked / verify now).");
        }

        // 2. Asking for password / OTP / PIN
        if (
            lower.includes("share your password") ||
            lower.includes("otp") ||
            lower.includes("pin") ||
            lower.includes("cvv")
        ) {
            reasons.push("Asking for sensitive information like password, OTP, PIN or CVV.");
        }

        // 3. HTTP but not HTTPS
        if (lower.includes("http://") && !lower.includes("https://")) {
            reasons.push("Link is using 'http://' instead of secure 'https://'.");
        }

        // 4. Strange looking domain (many dashes)
        if (text.match(/https?:\/\/[a-z0-9\-\.]+/i)) {
            var dashCount = (text.match(/-/g) || []).length;
            if (dashCount >= 3) {
                reasons.push("URL contains many '-' characters, looks suspicious.");
            }
        }

        // 5. Raw IP address in URL
        if (text.match(/\b\d{1,3}(\.\d{1,3}){3}\b/)) {
            reasons.push("URL seems to use a raw IP address instead of normal domain.");
        }

        // Decide risk level
        var risk;
        if (reasons.length === 0) {
            risk = "low";
            reasons.push("No obvious phishing pattern detected, but user should still be careful.");
        } else if (reasons.length <= 2) {
            risk = "medium";
        } else {
            risk = "high";
        }

        showResult("Analysis complete.", risk, reasons);
    });

    /**
     * Update result box UI
     * @param {string} title
     * @param {"low"|"medium"|"high"|"none"} risk
     * @param {string[]} reasons
     */
    function showResult(title, risk, reasons) {
        if (!resultBox) return;

        resultBox.classList.remove("hidden");

        var tagHtml = "";
        if (risk === "low") {
            tagHtml = '<span class="tag tag-safe">Low Risk</span>';
        } else if (risk === "medium") {
            tagHtml = '<span class="tag tag-medium">Medium Risk</span>';
        } else if (risk === "high") {
            tagHtml = '<span class="tag tag-danger">High Risk (Possible Phishing)</span>';
        } else {
            tagHtml = "";
        }

        var reasonsHtml = "";
        if (reasons && reasons.length > 0) {
            reasonsHtml = '<ul class="reason-list">' +
                reasons.map(function (r) {
                    return "<li>" + escapeHtml(r) + "</li>";
                }).join("") +
                "</ul>";
        }

        var helperText = "";
        if (risk === "high" || risk === "medium") {
            helperText = '<p class="helper-text">' +
                "Suggestion: Do not click unknown links, do not share OTP/password, and verify from the official website or app." +
                "</p>";
        } else if (risk === "low") {
            helperText = '<p class="helper-text">' +
                "This still does not guarantee 100% safety. Always double check the sender and website address." +
                "</p>";
        }

        resultBox.innerHTML =
            '<div class="result-title">' + escapeHtml(title) + tagHtml + "</div>" +
            reasonsHtml +
            helperText;
    }

    // Basic HTML escaping to avoid issues if user pastes HTML
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
});
