# Implementation Plan – PawHome Updates & Feature Additions

This plan outlines the changes needed to integrate the new logo, fix user and admin authorization navbar behaviors, implement user-submitted pet adoptions with admin approval, and create a fully-fledged blog post management system for users and admins.

## User Review Required

> [!IMPORTANT]
> **Database Changes**: We will add a new `Blog` model to MongoDB and modify the `Pet` model to support an `approved` boolean field (defaulting to `false` for user-submitted pets).
> **Auth Management**: The client navbar will check both `user` and `adminUser` stores in `localStorage` to display options based on the active role.

## Open Questions

None at the moment. All requirements align with Express/Next.js conventions.

---

## Proposed Changes

### Backend Components

#### [NEW] [Blog.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/models/Blog.js)
- Define the Blog schema: `title`, `category` (enum), `content`, `excerpt`, `imageUrl`, `author` (User ref), `approved` (boolean).

#### [NEW] [blogController.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/controllers/blogController.js)
- Implement `getBlogs` (optionally authenticated), `getBlog`, `createBlog` (force `approved: false` for standard users, `approved: true` for admins), `updateBlog`, `deleteBlog`, and `approveBlog`.

#### [NEW] [blogRoutes.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/routes/blogRoutes.js)
- Expose endpoints:
  - `GET /api/blogs` (public / optional auth)
  - `GET /api/blogs/:id` (public / optional auth)
  - `POST /api/blogs` (protected)
  - `PUT /api/blogs/:id` (protected)
  - `DELETE /api/blogs/:id` (protected)
  - `PUT /api/blogs/:id/approve` (admin only)

#### [MODIFY] [server.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/server.js)
- Import and mount `/api/blogs` router.

#### [MODIFY] [Pet.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/models/Pet.js)
- Add `approved: { type: Boolean, default: false }` to the Schema.

#### [MODIFY] [petRoutes.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/routes/petRoutes.js)
- Update `GET /` to use a `protectOptional` middleware.
- Modify `POST /` to remove the strict `requireRole('admin')` check so that users can submit pets.

#### [MODIFY] [petController.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/backend/controllers/petController.js)
- In `getPets`, restrict query to `approved: true` by default unless request is made by an admin.
- In `createPet`, check `req.user.role`. Force `approved: false` for normal users, default `approved: true` for admins.

---

### Frontend Components

#### [MODIFY] [Navbar.jsx](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/components/Navbar.jsx)
- Replace Lucide icon and "PawHome" text logo with `<img>` tag targeting `/Assets/jullyspawlogo.png`.
- Improve role-based rendering: check for `user` and `adminUser` in `localStorage`.
- Display a link to "Admin Dashboard" if the user has an `admin` role.
- Support logging out of both scopes.

#### [MODIFY] [Footer.jsx](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/components/Footer.jsx)
- Replace icon logo and "PawHome" text with the image logo.

#### [MODIFY] [Sidebar.jsx](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/components/admin/Sidebar.jsx)
- Replace admin panel text/icon branding with the image logo.
- Add "Blogs" navigation item.

#### [MODIFY] [api.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/services/api.js)
- Add user blog API endpoints: `getAll`, `getOne`, `create`.
- Add a user-submitted pet creation endpoint.

#### [MODIFY] [adminApi.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/services/adminApi.js)
- Add admin blog API endpoints: `getAll`, `update`, `delete`, `approve`.

#### [MODIFY] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/%28user%29/pets/page.js)
- Add "List a Pet for Adoption" button if a user is logged in.
- Filter to display available pets and show appropriate messages.

#### [NEW] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/%28user%29/pets/add/page.js)
- Form page for users to submit a pet for adoption (name, species, breed, age, gender, description, image URL).

#### [MODIFY] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/%28user%29/blog/page.js)
- Fetch articles from the backend API instead of using hardcoded mock posts.
- Add "Write a Blog Post" button if a user is logged in.

#### [NEW] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/%28user%29/blog/add/page.js)
- Form page for users/admins to write and submit a new blog post.

#### [NEW] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/admin/blogs/page.js)
- Admin blog management interface to list all posts, approve user posts, create new posts directly, and edit/delete existing ones.

#### [MODIFY] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/admin/pets/page.js)
- Update admin pet management table and forms to handle and toggle the `approved` status.

#### [MODIFY] [page.js](file:///d:/6th%20sem/pet-security-platform/Paw_and_meow/frontend/app/%28user%29/cart/page.js)
- Dispatch `cartUpdated` events when quantities are updated or items are removed so the header updates dynamically.

---

## Verification Plan

### Automated Tests
- We will start backend and frontend servers, checking for any compilation or runtime console errors.

### Manual Verification
- Test user registration and login.
- Submit a pet for adoption as a user, log in as admin, check if it shows up in admin pets panel, approve it, and verify that it appears on the public adoption page.
- Create a blog post as a user, log in as admin, approve it, and check that it is listed on the public blog page.
- Create a blog post directly as an admin, verifying it appears instantly as approved.
- Purchase an accessory, confirm the stock decrements correctly, and check the order appears in both user profile and admin orders panel.
