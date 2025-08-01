# ## 📹 Demo Video
#
# Watch the complete screen recording of the application demo here:
# [▶️ Watch Demo](<https://drive.google.com/file/d/1_kIVIDuXsd7ccDPJGEoDD3oZibDjmhaq/view?usp=sharing>)
#
# ---

# Group Insurance Quoting Tool – Technical Documentation

## 📚 Table of Contents
- [ Data Modeling & Schemas](#-data-modeling--schemas)
- [ Backend API & Logic Overview](#-backend-api--logic-overview)
- [ MongoDB Schemas](#-mongodb-schemas)
- [ How the Backend Was Designed](#-how-the-backend-was-designed)
- [ Frontend Overview](#-frontend-overview)
- [ Developer Report & Implementation Audit](#-developer-report--implementation-audit)

---

<h2 id="data-modeling--schemas">🧱 Data Modeling & Schemas</h2>

The first step in building the application was designing robust MongoDB schemas using Mongoose. Each schema aligns with real-world entities like employers, insurance classes, and members.

Here’s a breakdown of how data is structured:

### 1. Group Schema
- Represents each employer with contact info and location details.
- Locations include ZIP, FIPS code, and number of employees.

### 2. ICHRA Class Schema
- Captures the classification of employees (e.g., full-time, part-time) and their contribution levels.
- Linked to groups via `group_id`.

### 3. Member Schema
- Members represent employees under a group and ICHRA class.
- Supports detailed demographic, employment, and financial fields.
- Includes support for dependents via an embedded schema.

### 4. Sliding Scale & FPL Schemas
- Help calculate premium subsidies using IRS guidelines and federal poverty data.

---

<h2 id="backend-api--logic-overview">🚀 Backend API & Logic Overview</h2>

Your backend is a Node.js + Express application structured with modular controllers and Mongoose-based models. Here's a breakdown of all backend responsibilities and API endpoints.

### 1. Group Management

| Method | Endpoint                   | Description                                |
|--------|----------------------------|--------------------------------------------|
| **POST**   | `/api/groups`              | Create a new group and location (via Ideon API) |
| **GET**    | `/api/groups`              | Get all groups                             |
| **PUT**    | `/api/groups/:id/refresh`  | Refresh a group from Ideon                 |
| **DELETE** | `/api/groups/:id`          | Delete a group                             |

### 2. ICHRA Class Management

| Method | Endpoint                      | Description                     |
|--------|-------------------------------|---------------------------------|
| **POST**   | `/api/ichra-classes`           | Create ICHRA class for a group  |
| **GET**    | `/api/ichra-classes/:groupId`  | Get all classes for a group     |
| **DELETE** | `/api/ichra-classes/:id`        | Delete a class                  |

### 3. Member Management

| Method | Endpoint                  | Description                   |
|--------|---------------------------|-------------------------------|
| **POST**   | `/api/members`             | Add new member                |
| **GET**    | `/api/members/:groupId`    | Get all members in a group    |
| **DELETE** | `/api/members/:id`         | Delete a member               |

### 4. Quote Generation

| Method | Endpoint                 | Description                              |
|--------|--------------------------|------------------------------------------|
| **POST**   | `/api/quote/off-market`    | Calculate premium for off-market plans  |
| **POST**   | `/api/quote/on-market`     | Calculate premium with subsidy (on-market) |

### 5. Affordability Calculator

| Method | Endpoint                     | Description                              |
|--------|------------------------------|------------------------------------------|
| **POST**   | `/api/affordability/check`     | Check if an ICHRA offer is affordable per IRS |

### 6. Plan Comparison Tool

| Method | Endpoint               | Description                           |
|--------|------------------------|-------------------------------------|
| **POST**   | `/api/comparison`         | Compare and rank plans based on filters |

### 7. Utilities

- IRS Sliding Scale Table (`models/irs_sliding_scale.js`)
- FPL Levels (`models/fpl.js`)
- Used in subsidy and affordability logic

---

<h2 id="mongodb-schemas">📦 MongoDB Schemas</h2>

### <h3>1. Group Schema (`models/Group.js`)</h3>

Each group represents an employer organization. It contains metadata and an array of locations.

```js
{
  chamber_association: Boolean,
  company_name: String,
  contact_name: String,
  contact_email: String,
  contact_phone: String,
  external_id: { type: String, unique: true },
  sic_code: String,
  locations: [{
    external_id: String,
    name: String,
    zip_code: String,
    fips_code: String,
    number_of_employees: Number,
    primary: Boolean
  }]
}
```

---

### <h3>2. ICHRA Class Schema (`models/IchraClass.js`)</h3>

Each class defines contribution rules for a group (e.g., full-time, part-time). These are used during quoting.

```js
{
  group_id: { type: mongoose.ObjectId, ref: 'Group' },
  class_name: String,
  subclass_name: String,
  contribution: {
    employee: Number,
    dependents: Number
  }
}
```

---

### <h3>3. Member Schema (`models/Member.js`)</h3>

Members are employees added to a group. They can optionally include dependents and advanced income/tobacco fields.

```js
{
  group_id: mongoose.ObjectId,
  ichra_class_id: mongoose.ObjectId,
  first_name: String,
  last_name: String,
  date_of_birth: String,
  gender: String,
  zip_code: String,
  fips_code: String,
  location_id: String,
  external_id: { unique: true },
  retiree: Boolean,
  cobra: Boolean,
  last_used_tobacco: Boolean,
  annual_salary: Number,
  hours_per_week: Number,
  household_income: Number,
  household_size: Number,
  safe_harbor_income: Number,
  old_employer_contribution: Number,
  old_employee_contribution: Number,
  ideon_id: String,
  dependents: [{
    first_name: String,
    last_name: String,
    date_of_birth: String,
    gender: String,
    last_used_tobacco: String,
    relationship: String,
    same_household: Boolean,
    id: String
  }]
}
```

---

### <h3>4. Sliding Scale Schema (`models/irs_sliding_scale.js`)</h3>

Used to calculate maximum applicable premium percentages for subsidies based on FPL (Federal Poverty Level).

```js
{
  min_fpl_percent: Number,
  max_fpl_percent: Number,
  applicable_percentage: Number  // Example: 0.0862 for 8.62%
}
```

---

### <h3>5. Federal Poverty Level Schema (`models/fpl.js`)</h3>

Stores official HHS poverty guidelines by year and household size.

```js
{
  year: Number,
  household_size: Number,
  lower_48: Number,
  alaska: Number,
  hawaii: Number
}
```

---

<h2 id="how-the-backend-was-designed">🧠 How the Backend Was Designed</h2>

The backend is powered by Express.js and modularized into controllers, routes, and models.

- **Controllers**: Contain business logic for each domain (group, member, class, quotes, etc.).
- **Routes**: Define RESTful endpoints under `/api/` namespace and map to controller methods.
- **Models**: Define schema validation and relations.

**Design Choices**:
- Used Ideon API to sync real insurance data during group creation.
- Used MongoDB to store normalized data and support filtering and fast access.
- Added quote comparison logic that calculates both off-market and on-market premiums using ICHRA contribution rules, IRS subsidy sliding scale, and FPL data.

---

<h2 id="frontend-overview">🖼️ Frontend Overview</h2>

The frontend is built using React and follows a clean modular file structure:

- `GroupForm`, `GroupList`: Create and display groups.
- `IchraClassForm`, `IchraClassList`: Manage ICHRA classes.
- `MemberForm`, `MemberList`: Onboard members and display them by class.
- `GroupDetailView`: Central screen that ties together all child components.
- `App.jsx`: Handles routing and modal toggling.

**User Journey**:
- Create a group (auto-fetches location from Ideon).
- Define ICHRA classes (by job type).
- Add members and dependents (with MemberForm and MemberList).
- Generate quotes for on-market/off-market plans.
- Check affordability and compare plan options.

---

<h2 id="developer-report--implementation-audit">📝 Developer Report & Implementation Audit</h2>

This section provides a full audit of what was built, why it was designed that way, and how the overall ICHRA-based group insurance quoting flow was implemented from scratch.

---

### 1. Schema Design: Real-World Alignment

All schemas were carefully designed to mirror real-world insurance entities:

- **Group Schema**: Captures employer info and one or more physical locations.
- **ICHRA Class Schema**: Allows categorization of employees with different contribution rules.
- **Member Schema**: Flexible enough to support salary, dependents, tobacco use, COBRA/retiree status, and more.
- **IRS Sliding Scale + FPL**: Used to power subsidy logic per official HHS and IRS guidance.

This normalized schema approach made it easy to query data, join collections, and scale across thousands of groups or members.

---

### 2. Backend Functionality: Modular API Architecture

Each domain (group, class, member, quotes, affordability, comparison) has its own:

- Mongoose model
- Controller with business logic
- Route file with clear endpoints under `/api/`

We connected to the **Ideon API** to:

- Create groups with validated zip/FIPS/location.
- Sync member and quote data where needed.

#### Key API Categories:

- **Groups**:
  - **POST** `/api/groups` - create group via Ideon.
  - **GET** `/api/groups` - list all groups.
  - **PUT** `/api/groups/:id/refresh` - re-fetch updated data.
  - **DELETE** `/api/groups/:id` - delete group.

- **ICHRA Classes**:
  - **POST** `/api/ichra-classes` - define class for a group.
  - **GET** `/api/ichra-classes/:groupId` - fetch all classes in a group.
  - **DELETE** `/api/ichra-classes/:id` - remove class.

- **Members**:
  - **POST** `/api/members` - onboard a member with optional dependents.
  - **GET** `/api/members/:groupId` - list members per group.
  - **DELETE** `/api/members/:id` - remove member.

- **Quoting**:
  - **POST** `/api/quote/off-market` - custom quotes using CSV plan data.
  - **POST** `/api/quote/on-market` - subsidy calculation via IRS/FPL.

- **Affordability**:
  - **POST** `/api/affordability/check` - checks if contribution is affordable per IRS rules.

- **Plan Comparison**:
  - **POST** `/api/comparison` - returns best plan sorted by filters.

---

### 3. Frontend Functionality: Interactive User Flow

- **GroupList / GroupForm** — lets employers create and view their profiles.
- **GroupDetailView** — the central dashboard, combining:
  - `IchraClassForm` + `IchraClassList` to define job categories.
  - `MemberForm` + `MemberList` to add employees/dependents.
  - `QuoteView` to run quoting for each group.
- **Modal Popups** — used for smooth member onboarding and class creation.

UI automatically updates on form submissions using internal `onRefresh` triggers passed to components.

---

### 4. Comparison & Affordability Logic

- We calculate **affordability** per the IRS Safe Harbor rule using:
  - Monthly contribution.
  - Salary or household income.
  - Sliding scale cap percentage.

- Quote **comparison** ranks plans based on premium, network, and subsidy eligibility.

---

### ✅ Key Features Built

- ICHRA-specific class management for job-based benefit design.
- Member onboarding with dependents + tobacco + salary fields.
- Ideon API integration for real-time employer/location setup.
- MongoDB-based dynamic quoting system with support for both CSV plans and federal subsidies.
- Modular and testable Express.js backend.
- Responsive React frontend.

---

Let me know if you'd like me to add screenshots, flow diagrams, or usage instructions next!
