## PrepTracker

[PrepTracker](https://prep-tracker.vercel.app/) is a full-stack AI accountability app that tracks student progress, sends motivational reminders, and provides
personalized insights to help CS students stay consistent in their tech interview preparation

## :pancakes: Technology Stack

- [TypeScript](https://www.typescriptlang.org/)
- Frontend
  - [Next.js](https://nextjs.org/)
  - [Tanstack Query](https://tanstack.com/query/latest)
  - [React Hook Form](https://react-hook-form.com/)
  - [ShadcnUi](https://ui.shadcn.com/)
  - [TailwindCSS](https://tailwindcss.com/)
  - [Zod](https://zod.dev/)
- Backend
  - [Node.js](https://nodejs.org/en)
  - [Express](https://expressjs.com/)
  - [Firebase Storage](https://firebase.google.com/products/storage)
  - [Firebase Auth](https://firebase.google.com/products/auth)
  - [Firebase Functions](https://firebase.google.com/products/functions)

## :star: Inspiration
As I approach my graduation on May, 2025, I realized I needed to brush up on my skills for upcoming tech interviews. 
Many computer science students face the same struggle when preparing for exams or interviews—staying motivated, setting clear goals, and tracking progress over time. This led to the creation of PrepTracker, 
a tool designed to help students manage and track their study goals in a personalized, AI-driven way.

## :hammer_and_pick: What it does
PrepTracker allows students to set daily, weekly, and one-time study goals over a span of the start and end date of the goals, track progress via a heatmap dashboard, and receive AI-generated motivational reminders via email. 
The tool helps students stay on top of their goals, providing a visual representation of their achievements and keeping them engaged throughout their study process.

## :european_castle: Architecture
This project is a monorepo where the frontend and backend code reside in the same repository. The Nextjs frontend communicates with the `Nodejs` backend. `Firebase Storage` has been used as 
the database and authentications is implemented using `Firebase Authentication`. The backend is deployed using Firebase functions, which is basically a serverless framework that lets us automatically 
run backend code in response to events triggered by HTTPS requests. For personalized reminders, I integrated Meta's `Llama 3.2 11B Vision Instruct` through `OpenRouter` to generate AI-driven motivational messages. 
A cron-job for sending customized emails reminiding students of their goals for the day is also implemented using `Firebase Schedule Functions`, `Twilio` and `SendGrid`. 
The frontend is deployed using `Vercel hosting`.

### Frontend
<img width="500" alt="Frontend code structure" src="https://github.com/user-attachments/assets/c83149e1-6624-4d67-8b36-f7b300771009">

### Backend
<img width="450" alt="Backend code structure" src="https://github.com/user-attachments/assets/ea3ff270-7b4e-493d-b287-a485de2955b8">

## :camera: Screenshots

### Login Page
Users can login with traditional email & password or with third party authentication such as Google and Github.
![Login page](https://github.com/user-attachments/assets/edfca8d6-028b-4658-a6b2-247c3f7ee7bd "Login page")


### Registration Page
Users can register with traditional email & password.
![Registration page](https://github.com/user-attachments/assets/9bf40b58-62a2-48e5-b70a-fe96b0dc7196 "Registration page")


### Forgot password page
Users can reset their password in case they have forgotten it.

![Forgot password page](https://github.com/user-attachments/assets/672eed00-06fb-4bb1-9562-cdd2c31807c8 "Forgot password page")

### Today's Goals

Users can view all their daily, weekly and one time goals for today
![Today's goals page]([https://github.com/user-attachments/assets/34e18408-3974-4bf0-8c77-76118d62b927) "Today's goals page")

### Tomorrow's Goals
Users can view all their daily, weekly and one time goals for tomorrow
![Today's goals page]([https://github.com/user-attachments/assets/1a6d85a0-e1d5-4bcc-8a9d-ee24d5e6281f) "Tomorrow's goals page")

### Next 7 Day's Goals
Users can view all their daily, weekly and one time goals for the next 7 days
![Next 7 Day's goals page]([https://github.com/user-attachments/assets/1237c29b-66e7-43ed-922a-93ce830d7741) "Today's goals page")

### Progress Page
Users can view a heatmap of their goals for the current year
![Progress Page]([https://github.com/user-attachments/assets/1ad7d7f2-ccb5-4924-a0ea-e61b5a943f06) "Progress Page")

## :rocket: How to launch
Just click on <a href="https://prep-tracker.vercel.app/" target="_blank">this</a> link!
