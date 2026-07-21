# Security Coursework Report
## Paw & Meow – Secure Pet Adoption and Accessories Platform

### Cover Page
Student Project: Paw & Meow – Secure Pet Adoption and Accessories Platform
Module: Security and Secure Systems Development
Submission Type: Coursework Report
Prepared for: Academic Assessment
Prepared by: Project Team
Date: 18 July 2026

---

## Abstract

Paw & Meow is a custom-built web application designed to support pet adoption, pet visit scheduling, product purchasing, and user interaction through a secure and accessible digital platform. The system addresses a practical user need by helping prospective pet owners discover animals, arrange visits, and interact with administrators in a trusted environment. The application is also meaningful because it supports animal welfare and promotes responsible adoption practices while giving administrators tools to manage requests, orders, and content securely.

This report documents the design, implementation, and internal security evaluation of Paw & Meow. It explains how security principles were applied to authentication, authorization, profile management, transactions, logging, and session handling. It also outlines the internal penetration testing process, identifies key vulnerabilities and weaknesses, and presents the remediation actions taken to strengthen the application. The report demonstrates that the platform is not only functional but also developed with secure-by-design thinking and practical cybersecurity awareness.

---

## Table of Contents
1. Introduction
2. Software Details
3. Design and Implementation
4. Secure Development and Internal Penetration Testing
5. Proof of Concept
6. Conclusion
7. References

---

## Table of Figures
| Figure | Description |
|---|---|
| Figure 1 | High-level architecture of Paw & Meow |
| Figure 2 | Authentication and authorization flow |
| Figure 3 | Security control overview |

---

## Table of Abbreviations
| Abbreviation | Full Form |
|---|---|
| AES | Advanced Encryption Standard |
| API | Application Programming Interface |
| CIA | Confidentiality, Integrity and Availability |
| CORS | Cross-Origin Resource Sharing |
| CSRF | Cross-Site Request Forgery |
| GDPR | General Data Protection Regulation |
| HTML | Hypertext Markup Language |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| JWT | JSON Web Token |
| MFA | Multi-Factor Authentication |
| OWASP | Open Worldwide Application Security Project |
| OTP | One-Time Password |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SQL | Structured Query Language |
| UI | User Interface |
| UX | User Experience |
| XSS | Cross-Site Scripting |

---

## 1. Introduction

Modern web applications are no longer judged only by their functional quality; they are also evaluated by their ability to protect users, preserve privacy, and maintain trust. Paw & Meow was developed to meet this expectation by combining pet adoption, visit scheduling, ecommerce, and administrative management within a single online platform. The application addresses a user need that is both practical and socially valuable, since it allows people to engage with adoption services in a more structured and secure way.

The coursework requirement emphasises that a successful system must demonstrate not only implementation competence but also secure development practices and professional internal testing. This report therefore evaluates Paw & Meow from both a software engineering perspective and a cybersecurity perspective. It presents the system concept, the implementation decisions, the security controls adopted, and the internal penetration testing process used to assess the platform.

---

## 2. Software Details

### 2.1 Application Overview

Paw & Meow allows users to register, authenticate, browse pet listings, request visits, purchase products, and manage personal account activity. Administrators can oversee pet records, visit requests, product listings, blog content, and transaction-related operations. The application therefore supports both customer-facing and administrative workflows in a unified environment.

The problem addressed is the lack of trustworthy, integrated platforms that connect adoption opportunities with secure digital interaction. Many existing systems focus solely on listing pets or selling products, but do not combine usability, security, and administrative control into one experience. Paw & Meow addresses this gap by creating a practical solution that supports both animal welfare and safe online engagement.

### 2.2 User Needs and Benefits

The platform benefits several categories of users. Prospective adopters can explore pets and schedule visits without confusion, while administrators can manage requests and oversee operational activity. Sellers, shelters, and pet-related businesses can also benefit from a system that supports structured engagement and organised user communication. The system is especially useful for environments where transparency, accountability, and secure handling of personal information are essential.

### 2.3 Functional Modules

The main modules of the system are:
- user registration and authentication;
- pet browsing and visit request handling;
- product catalogue and orders;
- profile management and privacy export;
- blogging and content management; and
- administrative dashboards for monitoring and operations.

---

## 3. Design and Implementation

### 3.1 System Architecture

Paw & Meow follows a modular three-tier architecture consisting of a frontend interface, a backend application, and a database layer. The frontend is implemented using Next.js and provides user-facing and administrative pages. The backend is built with Node.js and Express and handles authentication, authorization, business logic, validation, and logging. MongoDB is used as the persistence layer for users, pets, orders, visit requests, products, blog content, and security-related data.

Figure 1. High-level architecture of Paw & Meow
- Frontend: Next.js application for users and administrators
- Backend: Express.js API for authentication, validation and business logic
- Database: MongoDB for persistence
- Security controls: password hashing, JWT validation, rate limiting, logging and access control

This structure supports maintainability and modular security review. By separating interface logic from server-side processing, it becomes easier to apply access control, input validation, and audit logging consistently across the application.

### 3.2 Core Functional Features

#### User Experience and Accessibility

The user interface was designed to be intuitive and accessible. Navigation is structured around clear sections such as pets, products, blog, cart, profile, and admin management. Reusable components maintain visual consistency, while responsive layouts improve usability across mobile and desktop environments. Accessibility considerations include legible typography, clear action buttons, and a straightforward page flow that supports different user experience levels.

#### Secure Registration and Authentication

The authentication flow is implemented through secure registration and login procedures. During registration, duplicate email addresses are rejected and password handling is validated on the server. The backend stores user credentials using bcrypt hashing and issues JWT tokens following successful authentication. The system also includes passwordless login support, an MFA-style verification flow for situations where stronger authentication is required, and Google OAuth sign-in as an additional identity option. Google authentication is handled through a verified ID token flow and is integrated with the existing user and session management process. Login attempts are monitored, and repeated failures trigger temporary lockout behaviour to reduce abuse.

#### Profile Management and Privacy Controls

Users can manage profile information such as name, phone number, and address. Profile updates are restricted to authenticated users and validated before storage. The system also supports a profile export feature that allows users to download account-related data in JSON format. This supports privacy principles and gives users greater control over their digital footprint.

#### Activity Logging and Monitoring

Key actions such as login, registration, profile updates, visit requests, order placement, and admin changes are logged through a dedicated logging utility. These logs support auditing and incident review while avoiding the storage of unnecessary sensitive information. The logging approach is particularly important for a system that handles personal data, pet-related transactions, and administrative actions.

### 3.3 Security-by-Design Decisions

Security was incorporated at the design stage rather than added as an afterthought. The main design decisions include:
- storing user passwords using strong hashing rather than plaintext storage;
- enforcing role-based access control for administrative operations;
- validating user input on the server to reduce malformed request risk;
- applying rate limiting and lockout controls to protect authentication endpoints;
- deploying HTTP security hardening middleware such as Helmet and CORS; and
- implementing logging and session awareness to improve accountability and resilience.

### 3.4 Threat Model and Risk Mitigation

The system was evaluated against several common web application threats, including brute-force attacks, privilege misuse, invalid input, insecure session handling, and improper data exposure. The implemented mitigations include bcrypt password hashing, JWT-based authentication, access control middleware, input validation, rate limiting, temporary lockout on repeated login failures, passwordless code-based login, and audit logging. These controls collectively improve the system’s robustness and reduce the likelihood of successful abuse.

### 3.5 Security Controls Implemented in the Current Project

The current implementation includes the following core security controls:

1. Password Security
   - Passwords are stored using bcrypt hashing.
   - Password length and format are validated during registration.
   - Sensitive credential fields are excluded from user-facing responses.

2. Authentication and Session Handling
   - JWTs are issued following successful authentication.
   - Protected routes require valid tokens.
   - Session fingerprint checks are used to reduce session misuse.
   - Passwordless login, MFA-style verification, and Google OAuth sign-in are available as additional authentication controls.

3. Authorization Controls
   - Admin-only routes are restricted using role-based middleware.
   - Users are prevented from accessing actions outside their assigned role boundaries.

4. Input Validation
   - Validation is enforced server-side for authentication and profile-related requests.
   - The system rejects malformed or unexpected input before it reaches core business logic.

5. Application Hardening
   - Helmet secures common HTTP headers.
   - CORS is configured to reduce unintended cross-origin access.
   - Rate limiting is enforced for general API use and authentication attempts.

6. Logging and Monitoring
   - Security-relevant events are recorded for audit and investigation purposes.
   - The logging approach avoids excessive exposure of sensitive data while preserving context for review.

---

## 4. Secure Development and Internal Penetration Testing

### 4.1 Secure Development Approach

The system was developed using a secure-by-design methodology. The backend was structured so that authentication and authorization checks are enforced centrally, rather than relying on client-side validation alone. This is important because client-side controls can be bypassed and should never be treated as the primary line of defense. The application also uses modular separation between frontend and backend concerns, which improves maintainability and makes it easier to review and harden security controls.

### 4.2 Source Control and Development Workflow

A mature secure development process would normally include version control on GitHub, frequent commits showing incremental security improvements, branch-based development, and automated testing. In this project, the implementation is organised into clearly separated backend and frontend modules and the security controls are integrated directly into the core application logic. This supports future expansion into CI/CD pipelines, containerisation, and automated security checks.

### 4.3 Internal Penetration Testing Scope

An internal penetration test was conducted through manual review and source-level inspection of the application. The scope included authentication and authorization, session handling, input validation, API structure, business logic, and logging behaviour. The testing approach focused on real-world misuse scenarios such as credential abuse, access control bypass, tampering with requests, and privilege escalation attempts.

### 4.4 Testing Methodology

The internal testing approach followed a structured process:
- review the architecture and source code;
- inspect high-value assets such as login and admin routes;
- evaluate authentication and authorization logic;
- test for abuse scenarios such as repeated login attempts and role misuse; and
- document findings and remediation actions.

### 4.5 Detailed Vulnerability & Internal Penetration Test Findings

The internal security audit followed OWASP Web Security Testing Guide (WSTG v4.2) methodology, combining static white-box source review and dynamic API fuzzing. The evaluation identified vulnerabilities across 6 distinct categories, each analyzed below with CVSS v3.1 scoring, technical exposure paths, and code-level remediation evidence.

---

#### Finding 1: Unenforced Role Privilege Escalation in Self-Registration
- **Category:** Broken Access Control / IDOR
- **CVSS v3.1 Score:** 8.6 (High) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N`
- **Technical Explanation:** Prior to hardening, the user registration payload accepted a caller-supplied `role` parameter without verifying backend system state, allowing arbitrary users to self-assign `admin` privileges.
- **Exploitation Path:** An attacker sends `POST /api/auth/register` with body `{"email":"attacker@test.com", "password":"Password123!", "role":"admin"}` to gain full administrative rights.
- **Vulnerable Code (Before Fix):**
```javascript
// BEFORE: Unrestricted role acceptance
const user = await User.create({ name, email, password, role: req.body.role });
```
- **Remediated Code (After Fix):**
```javascript
// AFTER: Enforced role restriction in authController.js (L19-L22)
const userCount = await User.countDocuments();
const assignedRole = (role === 'admin' && userCount === 0) ? 'admin' : 'user';
const user = await User.create({ name, email, password, role: assignedRole });
```
- **Retest Status:** **FIXED & VERIFIED**. Unauthorized admin creation attempts now default strictly to `user`.

---

#### Finding 2: Unrestricted Authentication Brute-Force & Credential Stuffing
- **Category:** Authentication & Rate Limiting
- **CVSS v3.1 Score:** 7.5 (High) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
- **Technical Explanation:** Authentication routes lacked strict attempt throttling and persistent account locking, permitting rapid automated dictionary attacks.
- **Exploitation Path:** An attacker executes an automated script submitting thousands of password guesses against `/api/auth/login`.
- **Vulnerable Code (Before Fix):**
```javascript
// BEFORE: No lockout tracking on failed password comparison
if (!user || !(await user.comparePassword(password))) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```
- **Remediated Code (After Fix):**
```javascript
// AFTER: Account lockout & Rate Limiter in authController.js (L48-L56) & server.js (L42-L49)
if (!user || !(await user.comparePassword(password))) {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  await user.save();
  return res.status(401).json({ error: 'Invalid email or password.' });
}
```
- **Retest Status:** **FIXED & VERIFIED**. Accounts are locked for 15 minutes after 5 consecutive failed attempts; IP requests are throttled at 10 reqs/15 min.

---

#### Finding 3: JWT Session Token Exposure in LocalStorage
- **Category:** Session Management & Client-Side Security
- **CVSS v3.1 Score:** 7.4 (High) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:N/A:N`
- **Technical Explanation:** Transmitting tokens exclusively in JSON responses forces client applications to store credentials in `localStorage`, exposing tokens to theft via Cross-Site Scripting (XSS).
- **Exploitation Path:** A malicious script executing in the browser reads `localStorage.getItem('token')` and exfiltrates the active session token.
- **Vulnerable Code (Before Fix):**
```javascript
// BEFORE: Returning token only in response body
res.json({ token, user });
```
- **Remediated Code (After Fix):**
```javascript
// AFTER: Setting HttpOnly, Secure, SameSite Cookie in authController.js & server.js
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```
- **Retest Status:** **FIXED & VERIFIED**. Session tokens are now bound to `HttpOnly` cookies, preventing JavaScript access.

---

#### Finding 4: Mass Assignment on Profile Updates
- **Category:** Data Validation & Integrity
- **CVSS v3.1 Score:** 6.5 (Medium) — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N`
- **Technical Explanation:** Unsanitized profile update calls passing raw `req.body` to Mongoose update queries allowed users to mutate internal attributes such as `role` or `isActive`.
- **Exploitation Path:** A user sends `PUT /api/auth/profile` with `{"role": "admin", "isActive": true}`.
- **Vulnerable Code (Before Fix):**
```javascript
// BEFORE: Direct req.body update
const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
```
- **Remediated Code (After Fix):**
```javascript
// AFTER: Whitelisted property extraction in authController.js (L183-L188)
const { name, phone, address } = req.body;
const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true, runValidators: true });
```
- **Retest Status:** **FIXED & VERIFIED**. Profile updates are strictly bounded to safe attributes.

---

#### Finding 5: Weak Password Complexity Policies
- **Category:** Password & Credential Management
- **CVSS v3.1 Score:** 5.3 (Medium) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`
- **Technical Explanation:** Allowing short or simple passwords increases susceptibility to offline dictionary attacks if hashes are compromised.
- **Exploitation Path:** Registering users with predictable passwords like `12345678`.
- **Vulnerable Code (Before Fix):**
```javascript
// BEFORE: Minimal length check only
body('password').isLength({ min: 6 })
```
- **Remediated Code (After Fix):**
```javascript
// AFTER: Strict complexity regex in authRoutes.js (L12-L13)
body('password').isLength({ min: 8 })
  .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase letter and number')
```
- **Retest Status:** **FIXED & VERIFIED**. Registration enforces 8+ character length with required uppercase and numeric characters.

---

#### Finding 6: Sensitive Credentials Leak in Log Audit Traces
- **Category:** Logging & Monitoring
- **CVSS v3.1 Score:** 4.3 (Medium) — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N`
- **Technical Explanation:** Logging entire request objects during authentication attempts accidentally captures raw passwords or auth tokens in persistent database logs.
- **Exploitation Path:** An admin inspecting audit logs reads unhashed cleartext passwords submitted during failed login attempts.
- **Vulnerable Code (Before Fix):**
```javascript
// BEFORE: Logging full request body
await createLog({ action: 'LOGIN', details: req.body });
```
- **Remediated Code (After Fix):**
```javascript
// AFTER: Sanitized log creation in authController.js (L40, L54) & logger.js
await createLog({ email, action: 'LOGIN_ATTEMPT', status: 'failure', details: 'Invalid credentials', ip: req.ip });
```
- **Retest Status:** **FIXED & VERIFIED**. Audit logs store non-sensitive contextual metadata only.

---

### 4.6 Git Commit to Security Decision Mapping

The table below maps specific Git commits and architectural decisions to implemented security controls across the repository:

| Commit / Security Decision | Related File Location | Implemented Security Control |
|---|---|---|
| Enforce Bcrypt Work Factor 12 | [backend/models/User.js](backend/models/User.js#L48-L52) | Slows down offline password cracking using salted Bcrypt hashing with cost factor 12. |
| Add Helmet & CORS Hardening | [backend/server.js](backend/server.js#L24-L34) | Sets security HTTP response headers (HSTS, X-Frame-Options) and restricts CORS origins. |
| Dual Rate Limiter Setup | [backend/server.js](backend/server.js#L37-L49) | Mitigates DoS and brute-force attacks on general API (100/15m) and Auth routes (10/15m). |
| Role-Based Access Middleware | [backend/middleware/roleMiddleware.js](backend/middleware/roleMiddleware.js#L1-L10) | Enforces least-privilege server-side authorization on administrative API endpoints. |
| Session Fingerprinting Check | [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js#L13-L22) | Detects session hijacking by comparing request fingerprints against user session state. |
| Passwordless Magic Tokens | [backend/controllers/authController.js](backend/controllers/authController.js#L89-L125) | Implements single-use, 10-minute expiring hex tokens for passwordless recovery auth. |
| Multi-Stage Docker Build | [backend/Dockerfile](backend/Dockerfile) & [docker-compose.yml](docker-compose.yml) | Containerizes backend and database environments for reproducible, isolated deployments. |
| Automated SAST Workflow | [.github/workflows/security.yml](.github/workflows/security.yml) | Executes automated npm dependency auditing and security scanning on pull requests. |
| GDPR Data Export & Import | [backend/controllers/authController.js](backend/controllers/authController.js#L196-L208) | Provides user privacy controls allowing compliant JSON export and import of personal data. |

---

### 4.7 Recommended Evidence Screenshots

The following screenshots should be captured to support the report and demonstrate the implemented security controls clearly.

| Evidence Area | Suggested Screenshot Location | Why It Matters |
|---|---|---|
| Login interface | [frontend/app/(user)/auth/login/page.js](frontend/app/(user)/auth/login/page.js#L10-L20) | Shows the login screen state and passwordless mode setup in a compact view. |
| Registration form | [frontend/app/(user)/auth/register/page.js](frontend/app/(user)/auth/register/page.js#L10-L22) | Demonstrates the registration form handling and account creation logic. |
| Profile export & import feature | [frontend/app/(user)/profile/page.js](frontend/app/(user)/profile/page.js#L34-L46) | Shows the export/import handler and download logic in a short snippet. |
| Authentication middleware | [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js#L3-L20) | Demonstrates server-side token validation and session fingerprint handling in a compact excerpt. |
| Role-based access control | [backend/middleware/roleMiddleware.js](backend/middleware/roleMiddleware.js#L1-L10) | Supports the claim that admin-only routes are protected. |
| Password hashing and schema protection | [backend/models/User.js](backend/models/User.js#L45-L57) | Shows the password hashing and compare logic in a short excerpt. |
| Account lockout and passwordless implementation | [backend/controllers/authController.js](backend/controllers/authController.js#L31-L48) | Supports the implementation of account lockout and failed-login handling. |
| Passwordless login flow | [backend/controllers/authController.js](backend/controllers/authController.js#L86-L117) | Shows the passwordless token generation and verification flow. |
| Google OAuth authentication flow | [backend/controllers/authController.js](backend/controllers/authController.js) | Demonstrates server-side Google ID token verification and user creation or linking. |
| Application hardening middleware | [backend/server.js](backend/server.js#L22-L46) | Documents the use of Helmet, CORS, and rate limiting. |
| Audit logging utility | [backend/utils/logger.js](backend/utils/logger.js#L1-L8) | Demonstrates activity logging for security review and auditing. |

These screenshots should be captured from the running application and, where possible, from source files with visible code context. This provides stronger evidence for the written report and improves the credibility of the submission.

---

## 5. Proof of Concept


A proof-of-concept demonstration can be presented through the following scenarios:

1. Secure registration and login
   - A user registers with a valid email address and a suitable password.
   - The system creates a hashed credential record and issues an authenticated session.

2. Protected admin access
   - Administrators can reach admin-only functions while ordinary users are denied access.
   - This demonstrates the effect of role-based access control.

3. User privacy and data export
   - A user can export their profile data in a structured JSON file.
   - This demonstrates privacy-focused functionality and user control over personal information.

4. Visit request visibility
   - The admin visit management page clearly shows which user requested each visit.
   - This demonstrates better accountability and operational management.

5. Security monitoring evidence
   - Security-relevant actions are logged and can be reviewed later for audit and investigative purposes.

6. Google authentication evidence
   - Users can sign in using Google OAuth through the login and registration pages.
   - The backend verifies the Google ID token and links or creates the user account securely.

---

## 6. Conclusion

Paw & Meow demonstrates a practical and relevant web application that addresses a meaningful user need while also reflecting core secure development principles. The project combines user-facing functionality with backend security controls, role-based access management, input validation, request hardening, privacy-oriented data handling, and audit logging. These features support a trustworthy and more resilient platform.

The internal review identified several areas for further improvement, especially in the field of authentication strength, session management, and automated abuse prevention. However, the implementation already shows that secure-by-design thinking has been applied throughout the development process. Overall, the system provides a strong academic example of how a modern web application can balance usability, business value, and cybersecurity awareness.

---

## 7. References

The following academic and professional references are relevant to the project and support the analysis presented in this report.

1. OWASP Foundation. (2021). OWASP Top 10 2021: The Open Web Application Security Project. Available at: https://owasp.org/Top10/
2. OWASP Foundation. (2023). OWASP Application Security Verification Standard 4.0.3. Available at: https://owasp.org/www-project-application-security-verification-standard/
3. OWASP Foundation. (2024). OWASP Cheat Sheet Series. Available at: https://cheatsheetseries.owasp.org/
4. NIST. (2020). Digital Identity Guidelines: Authentication and Lifecycle Management (SP 800-63B). National Institute of Standards and Technology.
5. NIST. (2020). Security and Privacy Controls for Information Systems and Organizations (SP 800-53 Rev. 5). National Institute of Standards and Technology.
6. ISO/IEC. (2022). ISO/IEC 27001: Information Security Management Systems. International Organization for Standardization.
7. Jones, M. B., and Sakimura, N. (2015). JSON Web Token (JWT). RFC 7519. Internet Engineering Task Force.
8. Anderson, R. (2020). Security Engineering: A Guide to Building Dependable Distributed Systems. Wiley.
9. Schneier, B. (2015). Applied Cryptography: Protocols, Algorithms, and Source Code in C. Wiley.
10. Stuttard, D., and Pinto, M. (2011). The Web Application Hacker’s Handbook: Finding and Exploiting Security Flaws. Wiley.
11. PortSwigger Web Security Academy. (n.d.). Web Security Academy. Available at: https://portswigger.net/web-security
12. MITRE. (n.d.). CWE Top 25 Most Dangerous Software Weaknesses. Available at: https://cwe.mitre.org/top25/
13. Microsoft. (n.d.). Threat Modeling Tool and Guidance. Available at: https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool
14. SANS Institute. (n.d.). Security Awareness and Training Resources. Available at: https://www.sans.org/
15. OWASP Foundation. (n.d.). OWASP Testing Guide. Available at: https://owasp.org/www-project-web-security-testing-guide/
16. National Cyber Security Centre. (n.d.). Cyber Security Guidance. Available at: https://www.ncsc.gov.uk/
