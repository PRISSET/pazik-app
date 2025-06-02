import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UserNav from "./components/UserNav";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Пацик - Организация игр и аниме",
  description: "Сайт для пациков, где можно договориться о дате игры и рекомендовать аниме",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div id="neon-effects">
          <div className="sakura-container">
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
            <div className="sakura-leaf"></div>
          </div>
        </div>
        <header className="border-b border-gray-800 backdrop-blur-sm bg-black/30 fixed w-full z-20">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold accent-glow">
                <span className="text-white">Пацик</span>
              </h1>
              <p className="ml-4 text-sm font-semibold text-purple-400 neon-text">Пацики Гасимся</p>
            </div>
            <div className="flex items-center">
              <nav className="mr-6">
                <ul className="flex space-x-6">
                  <li>
                    <a href="/" className="hover:text-white hover:accent-glow transition-all">
                      Главная
                    </a>
                  </li>
                  <li>
                    <a href="/games" className="hover:text-white hover:accent-glow transition-all">
                      Игры
                    </a>
                  </li>
                  <li>
                    <a href="/anime" className="hover:text-white hover:accent-glow transition-all">
                      Аниме
                    </a>
                  </li>
                </ul>
              </nav>
              <UserNav />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 pt-24 pb-12 min-h-screen z-10 relative">
        {children}
        </main>
        <footer className="border-t border-gray-800 bg-black/50 py-6 z-10 relative">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Пацик - Сделано с ❤️ для пациков</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
