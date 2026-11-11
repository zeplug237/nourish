# NOURISH HUB Task Management System

A responsive front-end task management prototype for NOURISH HUB with CEO employee oversight and a Google Gemini-powered AI helper.

## What's included

- Separate login and account-creation screens.
- Roles: CEO, Manager, Account Manager, Secretary and Program Coordinator.
- CEO dashboard employee cards with read-only staff profiles.
- Employee profile summaries showing individually assigned tasks, completed tasks, overdue tasks and completion percentage.
- Task assignment to a registered employee or to a department role.
- Gemini AI assistant on the login page for general questions.
- Gemini AI assistant inside the workspace. It receives the signed-in user's role and their individually assigned task details as context.
- Existing finance, meeting/event and task management views.

## Run locally

Requirements: Node.js 18 or newer.

1. Extract the ZIP file.
2. Open a terminal in the extracted `nourish_hub_task_manager` folder.
3. Copy `.env.example` to a new file named `.env`.
4. Add your Gemini API key to `.env`:

   ```env
   GEMINI_API_KEY=your_real_google_gemini_api_key
   PORT=3000
   ```

5. Start the app:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The key is read by `server.js` and is never embedded in the browser JavaScript. Do not share your `.env` file or commit it to GitHub.

## CEO read-only employee profiles

After employees create accounts in this prototype, the CEO sees employee profile cards on the Overview dashboard and in the Team section. The CEO can open a profile and review task progress, but the profile screen contains no edit or delete controls.

For meaningful individual performance reporting, assign new tasks to a named registered employee in the task form. Older sample tasks assigned only to a department role are kept as role-level tasks and are not counted as an individual's personal tasks.

## Important deployment and security limitations

**This is still a front-end prototype, not a production-ready multi-user system.** Accounts, tasks, finance records and events are stored in the browser's `localStorage`. That means each browser/device has its own data; employees on different devices will not automatically share a central organisation database. Client-side role checks are not a security boundary, and public account creation currently allows a user to choose a role.

Before launching for real NGO staff, replace browser-only authentication and storage with a secure backend and shared database. The backend must verify user identity and role on every request, make CEO profile endpoints read-only, prevent users from assigning themselves privileged roles, and enforce department permissions server-side. Do not rely on hiding buttons in the browser for access control.

The AI endpoint keeps the Gemini key on the server, but the current prototype does not yet authenticate AI requests with a server-managed user session. Deploy it behind the secure authentication layer before exposing it publicly. Avoid entering sensitive employee, beneficiary, donor or financial information into the AI assistant unless NOURISH HUB has approved that use and its data-handling arrangements.
