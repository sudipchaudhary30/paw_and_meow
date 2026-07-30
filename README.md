#  Paw & Meow | Pet Adoption & Security Platform

<img width="1501" height="773" alt="image" src="https://github.com/user-attachments/assets/863735a6-db73-4bd4-a840-febe77300620" />


**Paw & Meow** is a web platform designed to streamline pet adoptions, schedule shelter visits, manage pet care products, and connect pet lovers with animals in need. Built using Next.js for the frontend and Node.js with Express and MongoDB for the REST API backend, the application features an intuitive interface for browsing available pets, listing animals for adoption, tracking vaccination and health statuses, managing blog posts, and conducting e-commerce transactions with integrated eSewa payment support.

To ensure enterprise-grade application security, the platform underwent comprehensive penetration testing and remediation following PETS security standards. Key defense measures implemented include strict password complexity validation, Double-Submit Cookie CSRF protection, recursive XSS input sanitization, file upload magic-byte signature checking, AES-256-CBC encryption for sensitive user PII at rest, rate limiting against brute-force attacks, and a Zero-Trust session model that stores authentication tokens strictly inside `HttpOnly`, `Secure`, and `SameSite=Strict` cookies.
