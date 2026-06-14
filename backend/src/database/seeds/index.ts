import { database } from '../connection';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Seed Categories
    await database.query(`
      INSERT INTO categories (name, description) VALUES
      ('Electronics', 'Electronic devices and gadgets'),
      ('Clothing', 'Apparel and fashion items'),
      ('Books', 'Books and educational materials'),
      ('Home & Garden', 'Home and garden products')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Categories seeded');

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await database.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@ecommerce.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    console.log('✅ Admin user seeded');

    // Seed Sample Users
    const customerPassword = await bcrypt.hash('password123', 10);
    await database.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('John Doe', 'john@example.com', $1, 'customer'),
      ('Jane Smith', 'jane@example.com', $1, 'customer')
      ON CONFLICT (email) DO NOTHING;
    `, [customerPassword]);
    console.log('✅ Sample users seeded');

    // Seed Products
    await database.query(`
      INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES
      ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 79.99, 50, 1, 'https://via.placeholder.com/300?text=Headphones'),
      ('Smart Watch', 'Feature-rich smartwatch with fitness tracking', 199.99, 30, 1, 'https://via.placeholder.com/300?text=SmartWatch'),
      ('Cotton T-Shirt', 'Comfortable cotton t-shirt available in multiple colors', 19.99, 100, 2, 'https://via.placeholder.com/300?text=TShirt'),
      ('Jeans', 'Classic denim jeans with modern fit', 59.99, 80, 2, 'https://via.placeholder.com/300?text=Jeans'),
      ('Programming in Python', 'Learn Python programming from basics to advanced', 39.99, 150, 3, 'https://via.placeholder.com/300?text=PythonBook'),
      ('Web Design Guide', 'Complete guide to modern web design principles', 49.99, 120, 3, 'https://via.placeholder.com/300?text=WebBook'),
      ('Garden Tools Set', 'Complete set of essential gardening tools', 89.99, 40, 4, 'https://via.placeholder.com/300?text=GardenTools'),
      ('Plant Pot', 'Decorative ceramic plant pot for indoor plants', 24.99, 200, 4, 'https://via.placeholder.com/300?text=PlantPot')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Products seeded');

    console.log('✅ Database seeding completed successfully');
    console.log('\n📝 Default Credentials:');
    console.log('  Admin - admin@ecommerce.com / admin123');
    console.log('  Customer - john@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
