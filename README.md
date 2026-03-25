# 🌾 Wither | AI Agri-Weather Assistant 
**Wither** is a specialized weather application built for farmers and for daily  uses around the world . It provides real-time weather data and AI-driven agricultural advice to help optimize farming schedules and crop management.

---

## 🚀 Live Demo
You can access the live application here:  
**[witherapp.tech](https://witherapp.tech)**

---

## ✨ Key Features
* **Hyper-Local Weather:** Real-time weather based on precise geolocation, and includes search option for a more precise experience, where users can search for a specific residence .
* **AI Farming Insights:** Automated advice on whether it's a good time for planting, harvesting, or spraying.
* **SEO Optimized:** Verified through Google Search Console with a custom favicon.
* **Mobile-First UI:** Responsive design built using Tailwind CSS for farmers on the go.
* **Data Graph:** Includes detailed graph for farmers to map out effective planning 

---

## 🛠️ Tech Stack
* **Framework:** [React.js](https://reactjs.org/) (Vite)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
* **Deployment:** [Vercel](https://vercel.com/)
* **API:** OpenWeatherMap API,Aladhan & Google Gemini AI(Yet to implement)

---

## ⚙️ Engineering Highlights
One of the main challenges during development was optimizing the mobile experience:
* **GPS Jitter:** Implemented coordinate rounding to prevent unnecessary API refetches caused by minor mobile GPS fluctuations.
* **Performance:** Configured `staleTime` (5 mins) and disabled `refetchOnWindowFocus` to save battery and data on mobile browsers.
* **SEO:** Successfully implemented custom TXT records for domain ownership and configured `<head>` tags for proper Google indexing.

---

## 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Ajayi1428Muhammad/wither.git](https://github.com/Ajayi1428Muhammad/wither.git)

2. **Install dependencies:**
```bash
npm install
```
3. **Environment Variables:**
Create a `.env` file in the root directory and input your API Keys
```env
VITE_WEATHER_API_KEY=your_weather_key
VITE_GEMINI_API_KEY=your_gemini_key
```
4. **Run in development mode:**
```bash 
npm run dev
```
## 📩 Feedback
I’m constantly improving Wither. If you have suggestions or find a bug, please let me know!
[Send your feedback here](https://docs.google.com/forms/d/e/1FAIpQLScg_6vArtfKqUUZ9vJ-wFfX7a8qCkcJZaazQ4QgHYtVAgnPQQ/viewform?usp=send_form)


