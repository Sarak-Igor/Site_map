# ✍️ Development Guidelines and Code Writing

This document defines the quality standards, nomenclature, and technical behavior to ensure clean, performant, and modular code.

---

## 🌍 Language and Performance
* **Internal Reasoning:** All technical thought processes and architecture must be done in English for maximum technical precision.
* **Interface:** Interaction with the end-user (error messages, UI logs) must be in Portuguese.

---

## 🛠️ Architecture and Quality
* **Strict Modularity:** The code must be designed so modules can be migrated to microservices with zero changes to business logic.
* **Dependency Injection:** Avoid instantiating dependencies (database, API clients) inside functions or services. Use dependency injection to facilitate decoupling and testing.
* **Clean Code:** Strictly follow PEP8 (Python) or the standard practices of the language used.
* **Dead Code Removal:** It is forbidden to keep unused imports, obsolete functions, or commented-out code (dead code).

---

## 🏷️ Nomenclature and Semantics
* **Meaningful Names:** Variables and functions must reveal their intent. Avoid abbreviations (e.g., use `user_repository` instead of `u_repo`).
* **Self-Documenting Code:** The code must be clear enough so it doesn't need comments explaining "what" it does. Comments should only explain the "why" of complex decisions.
* **Type Hinting:** Use static typing (Type Hints) in all function and variable definitions to ensure safety and clarity in contracts.

---

## 🚀 Structure and Functions
* **Single Responsibility (SRP):** Each function/class must do only one thing and do it with excellence.
* **DRY (Don't Repeat Yourself):** Extract repeated logic into utility functions in the `shared` directory.
* **Guard Clauses:** Handle errors and edge cases at the beginning of the function to avoid excessive `if/else` nesting.
* **Error Handling:** Never ignore exceptions. Implement meaningful logs and consistent returns.

---

## 📊 Return, Logs, and Commits
* **API Consistency:** All modules must return a consistent JSON response pattern (e.g., `{"data": ..., "error": ..., "message": ...}`).
* **Structured Logging:** Use log libraries instead of `print()`. Each log must identify the origin module.
* **Semantic Commits:** Keep the Git history clean using prefixes like:
    * `feat:` (new feature)
    * `fix:` (bug fix)
    * `refactor:` (code change that neither fixes a bug nor adds a feature)
    * `docs:` (documentation only)

---

## 🧼 Workspace Hygiene
* **Test Cleanup:** After fixing a bug or implementing a feature, immediately delete temporary files, debug logs, or local test scripts.
* **Sustainability:** Keep the structure lean. `.md` documentations should only be created or altered upon real necessity or explicit request.
* **Efficiency:** Optimize for memory and execution time. Use `lazy loading` or generators for large datasets.

---

> **Commitment:** "Clean code is not the one written first, but the one maintained with rigor."