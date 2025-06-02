import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4 accent-glow">Добро пожаловать, <span className="neon-text">Пацики</span>!</h2>
        <p className="text-lg max-w-3xl mx-auto">
          Место, где мы собираемся, чтобы организовать игровые сессии и обсудить аниме.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6 hover:transform hover:scale-[1.02] transition-all">
          <h3 className="text-2xl font-semibold mb-4 accent-glow">Игровые сессии</h3>
          <p className="mb-4">Запланируйте свою следующую игровую сессию. Выберите игру, дату и время!</p>
          <div className="mt-auto">
            <a href="/games" className="btn-primary inline-block">
              Перейти к играм
          </a>
          </div>
        </div>
        
        <div className="card p-6 hover:transform hover:scale-[1.02] transition-all">
          <h3 className="text-2xl font-semibold mb-4 accent-glow">Рекомендации аниме</h3>
          <p className="mb-4">Делитесь своими любимыми аниме и смотрите рекомендации от других пациков.</p>
          <div className="mt-auto">
            <a href="/anime" className="btn-primary inline-block">
              Смотреть аниме
            </a>
          </div>
        </div>
      </div>
      
      <section className="text-center py-8 mt-8 card backdrop-blur-lg">
        <h3 className="text-2xl font-semibold mb-4 neon-text">Пацики Гасимся!</h3>
        <p className="max-w-3xl mx-auto">
          Присоединяйтесь к нашим еженедельным сессиям и обсуждениям лучших аниме сезона.
        </p>
      </section>
    </div>
  );
}
