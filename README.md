# AffiliatePro - Premium Amazon Affiliate Website

A modern, full-stack affiliate marketing website built with Next.js, React, Tailwind CSS, and Supabase.

## Features

- **Public Website**
  - Beautiful home page with hero section and feature showcase
  - Product browsing and filtering by category
  - Detailed product pages with reviews and specifications
  - About and Contact pages
  - Responsive design for all devices

- **Admin Panel**
  - Secure admin login (password protected)
  - Complete CRUD operations for products
  - Add product features and key benefits
  - Edit and delete products
  - Manage product details and Amazon affiliate links

- **Database**
  - Supabase PostgreSQL backend
  - Tables for products, product values, reviews, and admin users
  - Optimized indexes for fast queries
  - Real-time data synchronization

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase project with admin credentials
- Environment variables configured

### Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_JWT_SECRET=your_jwt_secret
   ```

4. **Initialize the database**
   
   Run the setup script in your Supabase SQL editor:
   ```sql
   -- From /scripts/setup-admin.sql
   ```
   
   This creates:
   - Admin user (email: `admin@example.com`, password: `admin123`)
   - Sample products for demonstration
   - Product features/values

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Public site: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin/login`

## Usage

### Public Site

- **Home**: View features and product showcase
- **Products**: Browse all products with filtering by category
- **Product Details**: Read reviews, see features, and get affiliate links
- **About**: Learn about the company
- **Contact**: Get in touch

### Admin Panel

1. **Login**: Visit `/admin/login`
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Dashboard**: Manage all products
   - View all products in a table format
   - Edit existing products
   - Delete products
   - Add new products

3. **Add Product**: `/admin/dashboard/new`
   - Enter product details (name, description, price)
   - Set category and Amazon affiliate link
   - Add product image URL
   - Add key features and benefits

4. **Edit Product**: `/admin/dashboard/edit/[id]`
   - Modify product information
   - Add or remove features
   - Update pricing and links

## Project Structure

```
app/
├── page.tsx                 # Home page
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── products/
│   ├── page.tsx           # Products listing
│   └── [id]/
│       └── page.tsx       # Product details
├── about/
│   └── page.tsx           # About page
├── contact/
│   └── page.tsx           # Contact page
├── admin/
│   ├── login/
│   │   └── page.tsx       # Admin login
│   └── dashboard/
│       ├── page.tsx       # Dashboard
│       ├── new/
│       │   └── page.tsx   # Add product
│       └── edit/
│           └── [id]/
│               └── page.tsx # Edit product
└── api/
    └── admin/
        └── login/
            └── route.ts    # Login endpoint

lib/
├── supabase/
│   ├── client.ts          # Browser client
│   ├── server.ts          # Server client
│   └── proxy.ts           # Proxy for token refresh

scripts/
└── setup-admin.sql        # Database initialization
```

## Database Schema

### Products Table
- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Product price
- `affiliate_link`: Amazon affiliate link
- `image_url`: Product image URL
- `category`: Product category
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Product Values Table
- `id`: Primary key
- `product_id`: Foreign key to products
- `value_text`: Feature or benefit text
- `created_at`: Creation timestamp

### Reviews Table
- `id`: Primary key
- `product_id`: Foreign key to products
- `author`: Reviewer name
- `rating`: 1-5 rating
- `review_text`: Review content
- `created_at`: Creation timestamp

### Admin Users Table
- `id`: Primary key
- `email`: Unique email
- `password_hash`: Password hash
- `created_at`: Creation timestamp

## Customization

### Change Admin Credentials

1. Update the password hash in the admin table:
   ```sql
   UPDATE admin_users SET password_hash = '<new_base64_password>' WHERE email = 'admin@example.com';
   ```

2. Note: Use proper bcrypt hashing in production!

### Modify Categories

Edit the category options in:
- `/app/products/page.tsx` (line ~46)
- `/app/admin/dashboard/new/page.tsx` (line ~195)
- `/app/admin/dashboard/edit/[id]/page.tsx` (line ~254)

### Customize Styling

Update design tokens in `/app/globals.css`:
- Color scheme (oklch format)
- Font families
- Border radius
- Chart colors

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
npm run build
npm start
```

## Security Notes

⚠️ **Important for Production**:

1. **Use bcrypt for passwords**: The current implementation uses base64, which is NOT secure. Replace with bcrypt.

2. **Add proper authentication**: Consider using Supabase Auth instead of custom JWT tokens.

3. **Enable Row Level Security (RLS)**: Add RLS policies to your database tables.

4. **Validate inputs**: Always validate and sanitize user inputs on the backend.

5. **Use environment variables**: Never commit sensitive data to version control.

6. **HTTPS only**: Always use HTTPS in production.

## Contributing

To add new features:

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For issues or questions:
- Check the documentation
- Review the code comments
- Contact support

## License

This project is provided as-is for commercial use.

## Changelog

### v1.0.0 (Initial Release)
- Complete affiliate website with product catalog
- Admin panel with full CRUD operations
- Responsive design
- Supabase integration
- Admin authentication
