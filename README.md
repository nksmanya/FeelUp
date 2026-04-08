# FeelUp

FeelUp is a modern wellness & mood‑tracking web application built with **Next.js 16**, **Supabase**, **Cloudinary**, and **OpenAI**.  
It provides:

- Real‑time mood feeds
- Personal journal entries
- AI‑powered mood detection
- Image uploads with Cloudinary
- Role‑based access (admin, psychologist, user)

## Getting Started

1. **Install dependencies**  

   ```bash
   npm install
   ```

2. **Configure environment**  

   - Copy the example file:  

     ```bash
     cp .env.example .env.local
     ```  

   - Fill in the required keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `CLOUDINARY_URL`, etc.).

3. **Run the development server**  

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000> in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Starts the Next.js development server |
| `build` | Builds the production bundle |
| `start` | Runs the production server |
| `lint` | Lints the codebase (`eslint`) |
| `format` | Formats files with Prettier |
| `test` | Executes unit tests (`vitest`) |

## Project Structure

```
FeelUp/
├─ app/               # Next.js pages & layout
├─ components/        # Reusable UI components
├─ lib/               # Utilities (Supabase client, cache, Cloudinary)
├─ public/            # Static assets
├─ middleware.ts      # Authentication & role routing
└─ ...                # Other config files
```

## Contributing

1. Fork the repository.  
2. Create a feature branch.  
3. Open a pull request with a clear description of changes.  

Please keep the codebase lint‑free (`npm run lint`) and formatted (`npm run format`).

## License

MIT © FeelUp

---

*Feel free to explore the code, customize the UI, or extend the functionality!*
