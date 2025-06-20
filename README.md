# Orderly: A Campus Dining Queue Solution

## The Problem

On our university campus, the lunch rush creates a significant problem. Long queues form instantly in front of all restaurants, leading to campus-wide congestion, frustratingly long wait times for students, and a noisy, chaotic environment that makes it difficult for everyone to move around.

## The Solution

**Orderly** is a full-stack web application designed to eliminate these queues and streamline the campus dining experience. It provides a digital platform where students can browse restaurant menus, place orders remotely, and receive updates on their order status. Restaurants get a dedicated dashboard to manage incoming orders efficiently, reducing the need for physical queues and improving overall service speed and campus flow.

---

## Core Features

This project was built with a two-sided marketplace structure, providing a tailored experience for both **Customers** and **Restaurants**.

### Customer Features:

-   **Secure Authentication:** Customers can sign up and sign in to their own accounts.
-   **Restaurant Discovery:** Browse a list of all available campus restaurants.
-   **"Like" Favorite Restaurants:** Customers can "like" restaurants to save them. This feature uses an **optimistic UI update** for a seamless, instant user experience.
-   **Order Management:** Place orders directly from a restaurant's menu.
-   **Order History:** View a detailed history of all past orders.
-   **Real-Time Order Tracking:** See the live status of current orders (`Pending`, `Preparing`, `Ready`, etc.).

### Restaurant Features:

-   **Secure Authentication:** Restaurants have their own separate and secure accounts.
-   **Powerful Dashboard:** A dedicated dashboard to view and manage all active orders in real-time. Staff can update an order's status with a single click.
-   **Settings Management:** A separate, organized page where restaurant managers can:
    -   **Update the Menu:** Add, edit, or delete menu items using an intuitive pop-up modal.
    -   **Set Wait Times:** Update the estimated average wait time that is displayed to customers.
-   **Order History:** View a complete history of all fulfilled and cancelled orders.

### General Features:

-   **Modern, Responsive Frontend:** A fast and user-friendly interface built with Next.js, featuring both light and dark mode support for readability.
-   **Robust Backend API:** A secure and efficient API built with Python (FastAPI), featuring Pydantic data validation and a logical, well-documented structure.

---

## Tech Stack

-   **Backend:** Python, FastAPI, SQLModel (as the ORM), Uvicorn
-   **Frontend:** Next.js, React, TypeScript, SWR (for data fetching and state management), Tailwind CSS
-   **Database:** SQLite (for simplicity and ease of setup)

---

## Getting Started

To get this project running locally, you'll need to run both the backend server and the frontend development server.

### Prerequisites:

-   **Node.js and npm** (or yarn)
-   **Python 3.8+** and `pip`

### 1. Backend Setup (FastAPI)

```bash
# 1. Navigate to the server directory
cd server

# 2. (Recommended) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Create a local environment file by copying the example
# On Windows:
copy .env.example .env
# On macOS/Linux:
cp .env.example .env

# 4. Install the required Python dependencies
pip install -r requirements.txt

# 5. Start the backend server
fastapi dev main.py
```

The backend API will now be running at `http://localhost:8000`.

### 2. Frontend Setup (Next.js)

```bash
# 1. In a new terminal, navigate to the client directory
cd client

# 2. Create a local environment file by copying the example
# On Windows:
copy .env.example .env.local
# On macOS/Linux:
cp .env.example .env.local

# 3. Install the required Node.js dependencies
npm install

# 4. Run the frontend development server
npm run dev
```

The frontend application will now be available at `http://localhost:3000`. Open this URL in your browser.

---

## Live Demo & Credentials

You can access the live version of the application here:
**[food-ordering-app-mocha-nine.vercel.app](https://food-ordering-app-mocha-nine.vercel.app/)**

Use the following credentials to explore the app:

### Customer Account

-   **Email:** `customer@example.com`
-   **Password:** `password123`

### Restaurant Account

-   **Email:** `restaurant@example.com`
-   **Password:** `password123`

---

## Future Work

Given more time, the following features would be the next steps for this project:

-   **Implement a Test Suite:** The highest priority for future work would be to develop a comprehensive test suite. This would involve using **PyTest** for the backend API endpoints and business logic, and **Jest / React Testing Library** for the frontend components to ensure code quality and long-term stability.
-   **Real-Time Notifications:** Integrate WebSockets to provide instant notifications to users (e.g., a customer gets a browser notification when their order is ready for pickup).
-   **Search and Filtering:** Add a search bar to allow customers to quickly find specific restaurants or menu items, and filter restaurants by criteria like wait time or cuisine type.
-   **Data Analytics Dashboard:** Enhance the restaurant dashboard with analytics features, such as visualizing sales data with charts (e.g., daily revenue, popular items) and providing actionable insights for the restaurant owner.
