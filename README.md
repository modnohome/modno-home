# Modno Home

Інтернет-вітрина виробника модульних диванів: каталог моделей, сторінка кожного дивана з комплектацією та розмірами, галереї фото й відео, форми заявок з відправкою на пошту. Весь контент — тексти, ціни, фото, телефони — редагується через адмінку Payload CMS без правок коду.

Продакшн: [modno-home.vercel.app](https://modno-home.vercel.app)

## Стек

- **Next.js 16** (App Router) + **React 19**
- **Payload CMS 3** + **MongoDB** — контент і адмінка
- **Tailwind CSS 4**, **TypeScript 5**
- **S3-сумісне сховище** (Yandex Cloud Object Storage) — медіафайли
- **Resend** — листи із заявками
- `keen-slider` — слайдери, `yet-another-react-lightbox` — галерея

## Сторінки

| Маршрут                | Що це                                     |
| ---------------------- | ----------------------------------------- |
| `/`                    | Головна: hero, каталог, відео, відгуки    |
| `/sofa/[slug]`         | Сторінка моделі дивана                    |
| `/privacy-policy`      | Політика конфіденційності                 |
| `/admin`               | Адмінка Payload                           |
| `/api/[...slug]`       | REST і GraphQL API Payload                |
| `/api/form-submissions`| Приймання заявок з форм → лист на пошту   |

`robots.ts` і `sitemap.ts` генеруються автоматично.

## Модель контенту

**Колекції**

- `Sofas` — моделі диванів. Вкладки в адмінці: *Основная информация*, *Hero секция*, *Showcase секция*, *Комплектация*. Ключові поля: назва, категорія, ціна і стара ціна, прапорець `isActive` (показувати на сайті), фото картки, галерея слайдера, комплектація й розміри.
- `Media` — усі завантажені файли, зберігаються в S3.
- `Users` — доступ до адмінки.

**Глобали**

- `Home` — контент головної: заголовки hero, описи, тексти кнопок, секції.
- `Settings` — шапка сайту: телефон, години роботи, текст біля логотипа, відео в хедері.

> Фото диванів можуть братися двома способами: із завантаженої галереї `viewImages` або зі статичної папки `public/sofas/<folderName>/`. Якщо галерею заповнено — вона має пріоритет, а поле `viewsCount` ігнорується як застаріле.

## Форми заявок

Усі форми йдуть в один обробник `POST /api/form-submissions`, який надсилає лист через Resend на адресу з `CONTACT_EMAIL`. Типи заявок: зворотний дзвінок, запит каталогу, розрахунок вартості, питання про тканини й кольори. Обов'язкове поле одне — телефон.

> Відправник зашитий у коді як `Modno Home <info@modnohome.ru>`. Цей домен має бути підтверджений у Resend, інакше листи не підуть.

## Запуск

### Варіант A — локально

```bash
pnpm install
pnpm generate:types
pnpm generate:importmap
pnpm dev
```

Потрібен MongoDB — локальний або Atlas, адреса вказується в `DATABASE_URI`.

### Варіант B — Docker

```bash
docker-compose up
```

Підніме MongoDB і Next.js разом. У цьому режимі хост бази — `mongo`, тобто `DATABASE_URI=mongodb://mongo:27017/modno-home`. Ззовні Mongo доступна на порту `27018`.

Сайт — [localhost:3000](http://localhost:3000), адмінка — [localhost:3000/admin](http://localhost:3000/admin).

## Змінні оточення

Файлу `.env.example` у репозиторії немає — створи `.env` вручну з цими змінними.

| Змінна                     | Призначення                                              |
| -------------------------- | -------------------------------------------------------- |
| `DATABASE_URI`             | Рядок підключення до MongoDB                             |
| `PAYLOAD_SECRET`           | Ключ шифрування Payload — `openssl rand -base64 32`      |
| `NEXT_PUBLIC_SITE_URL`     | Публічна адреса сайту                                    |
| `NEXT_PUBLIC_PAYLOAD_URL`  | Адреса Payload API                                       |
| `S3_ENDPOINT`              | Ендпоїнт сховища                                         |
| `S3_REGION`                | Регіон, за замовчуванням `ru-central1`                   |
| `S3_BUCKET`                | Назва бакета                                             |
| `S3_ACCESS_KEY`            | Ключ доступу                                             |
| `S3_SECRET_KEY`            | Секретний ключ                                           |
| `NEXT_PUBLIC_S3_PUBLIC_URL`| Публічний префікс URL медіа                              |
| `RESEND_API_KEY`           | API-ключ Resend                                          |
| `CONTACT_EMAIL`            | Пошта, куди падають заявки з форм                        |

## Скрипти

| Команда                   | Опис                             |
| ------------------------- | -------------------------------- |
| `pnpm dev`                | Dev-сервер                       |
| `pnpm build`              | Продакшн-збірка                  |
| `pnpm start`              | Запуск продакшену                |
| `pnpm lint`               | ESLint                           |
| `pnpm generate:types`     | Генерація типів Payload          |
| `pnpm generate:importmap` | Генерація import map для адмінки |

Після зміни полів у колекціях чи глобалах треба перегенерувати типи: `pnpm generate:types`.

## Структура

```
├── app/
│   ├── (frontend)/          # головна, сторінка дивана, політика
│   ├── (payload)/           # /admin і /api Payload
│   └── api/form-submissions # обробник заявок
├── collections/             # Sofas, Media, Users
├── globals/                 # Home, Settings
├── components/
│   ├── sections/            # секції сторінок
│   ├── ui/                  # кнопки, інпути, картки
│   ├── forms/               # форми заявок
│   └── common/              # модалки, RichText
├── assets/                  # іконки та стилі
├── lib/                     # payload.ts, toSlug.ts
└── payload.config.ts
```

## Потрібні версії

Node.js 22.11.0, pnpm 10.16.1 — зафіксовані у `package.json` через [Volta](https://volta.sh/).

## Правила розробки

Код-стайл, робота зі стилями й архітектура компонентів описані в [DEVELOPMENT.md](DEVELOPMENT.md).
